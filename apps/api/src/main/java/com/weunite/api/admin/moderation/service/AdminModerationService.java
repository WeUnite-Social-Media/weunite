package com.weunite.api.admin.moderation.service;

import com.weunite.api.admin.moderation.dto.BanUserRequestDTO;
import com.weunite.api.admin.moderation.dto.AdminUserSummaryDTO;
import com.weunite.api.admin.moderation.dto.ReactivateUserRequestDTO;
import com.weunite.api.admin.moderation.dto.SuspendUserRequestDTO;
import com.weunite.api.common.exception.NotFoundResourceException;
import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.opportunities.repository.OpportunityRepository;
import com.weunite.api.posts.repository.CommentRepository;
import com.weunite.api.posts.repository.PostRepository;
import com.weunite.api.reports.domain.Report;
import com.weunite.api.reports.repository.ReportRepository;
import com.weunite.api.users.domain.Role;
import com.weunite.api.users.domain.User;
import com.weunite.api.users.exception.UserNotFoundException;
import com.weunite.api.users.repository.UserRepository;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.annotation.Transactional;

/** Service responsible for account moderation workflows. */
@Service
public class AdminModerationService {

  private final UserRepository userRepository;
  private final PostRepository postRepository;
  private final CommentRepository commentRepository;
  private final OpportunityRepository opportunityRepository;
  private final ReportRepository reportRepository;

  public AdminModerationService(
      UserRepository userRepository,
      PostRepository postRepository,
      CommentRepository commentRepository,
      OpportunityRepository opportunityRepository,
      ReportRepository reportRepository) {
    this.userRepository = userRepository;
    this.postRepository = postRepository;
    this.commentRepository = commentRepository;
    this.opportunityRepository = opportunityRepository;
    this.reportRepository = reportRepository;
  }

  @Transactional(readOnly = true)
  public List<AdminUserSummaryDTO> getUsersSummary() {
    Instant now = Instant.now();

    return userRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
        .map(user -> toUserSummary(user, now))
        .toList();
  }

  /** Permanently bans a user and resolves open reports against the user's content. */
  @Transactional
  public ResponseDTO<String> banUser(BanUserRequestDTO request, Long adminId) {
    User user = userRepository.findById(request.userId()).orElseThrow(UserNotFoundException::new);
    Instant now = Instant.now();

    user.setBanned(true);
    user.setBannedAt(now);
    user.setBannedReason(request.reason());
    user.setBannedByAdminId(adminId);
    userRepository.save(user);

    List<Report> userReports =
        reportRepository.findOpenContentReportsByUserId(
            user.getId(),
            List.of(Report.ReportStatus.PENDING, Report.ReportStatus.REVIEWED),
            Report.ReportType.POST,
            Report.ReportType.COMMENT,
            Report.ReportType.OPPORTUNITY);

    userReports.forEach(
        report -> {
          report.setStatus(Report.ReportStatus.RESOLVED);
          report.setActionTaken(Report.ActionTaken.USER_BANNED);
          report.setResolvedByAdminId(adminId);
          report.setResolvedAt(now);
        });

    reportRepository.saveAll(userReports);

    return new ResponseDTO<>(
        "Usuario banido com sucesso",
        String.format(
            "Usuario @%s foi banido permanentemente. %d denuncias foram resolvidas.",
            user.getUsername(), userReports.size()));
  }

  /** Suspends a user temporarily and optionally resolves a specific related report. */
  @Transactional
  public ResponseDTO<String> suspendUser(SuspendUserRequestDTO request, Long adminId) {
    User user = userRepository.findById(request.userId()).orElseThrow(UserNotFoundException::new);
    Instant now = Instant.now();

    user.setSuspended(true);
    Instant suspendedUntil = now.plus(request.durationInDays(), ChronoUnit.DAYS);
    user.setSuspendedUntil(suspendedUntil);
    user.setSuspensionReason(request.reason());
    userRepository.save(user);

    if (request.reportId() != null) {
      Report report =
          reportRepository
              .findById(request.reportId())
              .orElseThrow(() -> new NotFoundResourceException("Report"));
      if (!isReportAgainstUserContent(report, user.getId())) {
        throw new NotFoundResourceException("Report");
      }
      report.setStatus(Report.ReportStatus.RESOLVED);
      report.setActionTaken(Report.ActionTaken.USER_SUSPENDED);
      report.setResolvedByAdminId(adminId);
      report.setResolvedAt(now);
      reportRepository.save(report);
    }

    return new ResponseDTO<>(
        "Usuario suspenso com sucesso",
        String.format(
            "Usuario @%s foi suspenso por %d dia(s).",
            user.getUsername(), request.durationInDays()));
  }

  /** Reactivates a banned or suspended user. */
  @Transactional
  public ResponseDTO<String> reactivateUser(ReactivateUserRequestDTO request) {
    User user = userRepository.findById(request.userId()).orElseThrow(UserNotFoundException::new);

    user.setBanned(false);
    user.setBannedAt(null);
    user.setBannedReason(null);
    user.setBannedByAdminId(null);
    user.setSuspended(false);
    user.setSuspendedUntil(null);
    user.setSuspensionReason(null);
    userRepository.save(user);

    return new ResponseDTO<>(
        "Usuario reativado com sucesso",
        String.format("Usuario @%s voltou a ficar ativo.", user.getUsername()));
  }

  private AdminUserSummaryDTO toUserSummary(User user, Instant now) {
    Long userId = user.getId();
    String status = resolveStatus(user, now);

    return new AdminUserSummaryDTO(
        userId,
        user.getName(),
        user.getUsername(),
        user.getEmail(),
        extractRole(user),
        user.getProfileImg(),
        status,
        user.getCreatedAt(),
        user.getSuspendedUntil(),
        user.getBannedAt(),
        resolveModerationReason(user, status),
        calculateContentCount(userId),
        safeCount(
            reportRepository.countPendingContentReportsByUserId(
                userId,
                Report.ReportStatus.PENDING,
                Report.ReportType.POST,
                Report.ReportType.COMMENT,
                Report.ReportType.OPPORTUNITY)));
  }

  private String resolveStatus(User user, Instant now) {
    if (user.isBanned()) {
      return "banned";
    }

    if (user.isSuspended()) {
      Instant suspendedUntil = user.getSuspendedUntil();
      if (suspendedUntil == null || suspendedUntil.isAfter(now)) {
        return "suspended";
      }
    }

    return "active";
  }

  private String resolveModerationReason(User user, String status) {
    return switch (status) {
      case "banned" -> user.getBannedReason();
      case "suspended" -> user.getSuspensionReason();
      default -> null;
    };
  }

  private String extractRole(User user) {
    boolean hasAdminRole =
        user.getRole().stream().map(Role::getName).anyMatch("ADMIN"::equals);

    if (hasAdminRole) {
      return "admin";
    }

    return user.getRole().stream()
        .findFirst()
        .map(Role::getName)
        .map(role -> role.toLowerCase(Locale.ROOT))
        .orElse("basic");
  }

  private Long calculateContentCount(Long userId) {
    return safeCount(postRepository.countByUserIdAndDeletedFalse(userId))
        + safeCount(commentRepository.countByUserIdAndDeletedFalse(userId))
        + safeCount(opportunityRepository.countByCompanyIdAndDeletedFalse(userId));
  }

  private Long safeCount(Long value) {
    return value != null ? value : 0L;
  }

  private boolean isReportAgainstUserContent(Report report, Long userId) {
    return switch (report.getType()) {
      case POST -> postRepository.existsByIdAndUserId(report.getEntityId(), userId);
      case COMMENT -> commentRepository.existsByIdAndUserId(report.getEntityId(), userId);
      case OPPORTUNITY ->
          opportunityRepository.existsByIdAndCompanyId(report.getEntityId(), userId);
    };
  }
}
