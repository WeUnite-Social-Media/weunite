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

/** Servico responsavel pela moderacao de usuarios. Lida com suspensoes e banimentos de usuarios. */
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

  /** Bane um usuario permanentemente. Fecha TODAS as denuncias relacionadas ao usuario. */
  @Transactional
  public ResponseDTO<String> banUser(BanUserRequestDTO request) {
    User user = userRepository.findById(request.userId()).orElseThrow(UserNotFoundException::new);
    Instant now = Instant.now();

    // Marcar usuario como banido
    user.setBanned(true);
    user.setBannedAt(now);
    user.setBannedReason(request.reason());
    user.setBannedByAdminId(request.adminId());
    userRepository.save(user);

    // Resolver todas as denuncias pendentes do usuario
    List<Report> userReports = reportRepository.findPendingReportsByUser(user);
    userReports.forEach(
        report -> {
          report.setStatus(Report.ReportStatus.RESOLVED);
          report.setActionTaken(Report.ActionTaken.USER_BANNED);
          report.setResolvedByAdminId(request.adminId());
          report.setResolvedAt(now);
        });

    reportRepository.saveAll(userReports);

    return new ResponseDTO<>(
        "Usuario banido com sucesso",
        String.format(
            "Usuario @%s foi banido permanentemente. %d denuncias foram resolvidas.",
            user.getUsername(), userReports.size()));
  }

  /** Suspende um usuario temporariamente. Fecha APENAS a denuncia especifica (se fornecida). */
  @Transactional
  public ResponseDTO<String> suspendUser(SuspendUserRequestDTO request) {
    User user = userRepository.findById(request.userId()).orElseThrow(UserNotFoundException::new);
    Instant now = Instant.now();

    // Marcar usuario como suspenso
    user.setSuspended(true);
    Instant suspendedUntil = now.plus(request.durationInDays(), ChronoUnit.DAYS);
    user.setSuspendedUntil(suspendedUntil);
    user.setSuspensionReason(request.reason());
    userRepository.save(user);

    // Resolver apenas a denuncia especifica (se fornecida)
    if (request.reportId() != null) {
      Report report =
          reportRepository
              .findById(request.reportId())
              .orElseThrow(() -> new NotFoundResourceException("Report"));
      report.setStatus(Report.ReportStatus.RESOLVED);
      report.setActionTaken(Report.ActionTaken.USER_SUSPENDED);
      report.setResolvedByAdminId(request.adminId());
      report.setResolvedAt(now);
      reportRepository.save(report);
    }

    return new ResponseDTO<>(
        "Usuario suspenso com sucesso",
        String.format(
            "Usuario @%s foi suspenso por %d dia(s).",
            user.getUsername(), request.durationInDays()));
  }

  /** Reativa um usuario banido ou suspenso. */
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
}
