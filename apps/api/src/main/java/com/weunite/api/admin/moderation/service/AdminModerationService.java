package com.weunite.api.admin.moderation.service;

import com.weunite.api.admin.moderation.dto.AdminUserPageDTO;
import com.weunite.api.admin.moderation.dto.AdminUserSummaryDTO;
import com.weunite.api.admin.moderation.dto.BanUserRequestDTO;
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
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
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
  public AdminUserPageDTO getUsersSummary(int page, int size) {
    Instant now = Instant.now();
    Page<Long> userIdPage = userRepository.findUserIds(pageRequest(page, size));
    List<Long> userIds = userIdPage.getContent();

    if (userIds.isEmpty()) {
      return toPage(List.of(), userIdPage);
    }

    Map<Long, User> usersById =
        userRepository.findAllWithRolesByIdIn(userIds).stream()
            .collect(Collectors.toMap(User::getId, Function.identity()));
    Map<Long, Long> contentCounts = buildContentCounts(userIds);
    Map<Long, Long> pendingReportCounts = buildPendingReportCounts(userIds);

    List<AdminUserSummaryDTO> items =
        userIds.stream()
            .map(usersById::get)
            .map(user -> toUserSummary(user, now, contentCounts, pendingReportCounts))
            .toList();

    return toPage(items, userIdPage);
  }

  private AdminUserPageDTO toPage(List<AdminUserSummaryDTO> items, Page<Long> page) {
    return new AdminUserPageDTO(
        items,
        page.getNumber(),
        page.getSize(),
        page.getTotalElements(),
        page.getTotalPages(),
        page.hasNext(),
        page.hasPrevious());
  }

  private Pageable pageRequest(int page, int size) {
    int safePage = Math.max(page, 0);
    int safeSize = Math.max(1, Math.min(size, 100));
    return PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt"));
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
  public ResponseDTO<String> reactivateUser(ReactivateUserRequestDTO request, Long adminId) {
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

  private AdminUserSummaryDTO toUserSummary(
      User user, Instant now, Map<Long, Long> contentCounts, Map<Long, Long> pendingReportCounts) {
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
        contentCounts.getOrDefault(userId, 0L),
        pendingReportCounts.getOrDefault(userId, 0L));
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
    boolean hasAdminRole = user.getRole().stream().map(Role::getName).anyMatch("ADMIN"::equals);

    if (hasAdminRole) {
      return "admin";
    }

    return user.getRole().stream()
        .findFirst()
        .map(Role::getName)
        .map(role -> role.toLowerCase(Locale.ROOT))
        .orElse("basic");
  }

  private Map<Long, Long> buildContentCounts(List<Long> userIds) {
    Map<Long, Long> counts = new HashMap<>();
    mergeCounts(counts, postRepository.countActivePostsByUserIds(userIds));
    mergeCounts(counts, commentRepository.countActiveCommentsByUserIds(userIds));
    mergeCounts(counts, opportunityRepository.countActiveOpportunitiesByCompanyIds(userIds));
    return counts;
  }

  private Map<Long, Long> buildPendingReportCounts(List<Long> userIds) {
    Map<Long, Long> counts = new HashMap<>();
    mergeCounts(
        counts,
        reportRepository.countPendingPostReportsByUserIds(
            userIds, Report.ReportStatus.PENDING, Report.ReportType.POST));
    mergeCounts(
        counts,
        reportRepository.countPendingCommentReportsByUserIds(
            userIds, Report.ReportStatus.PENDING, Report.ReportType.COMMENT));
    mergeCounts(
        counts,
        reportRepository.countPendingOpportunityReportsByUserIds(
            userIds, Report.ReportStatus.PENDING, Report.ReportType.OPPORTUNITY));
    return counts;
  }

  private void mergeCounts(Map<Long, Long> target, List<Object[]> rows) {
    for (Object[] row : rows) {
      Long userId = asLong(row[0]);
      Long count = safeCount(asLong(row[1]));
      target.merge(userId, count, Long::sum);
    }
  }

  private Long asLong(Object value) {
    if (value instanceof Number number) {
      return number.longValue();
    }

    throw new IllegalArgumentException("Expected numeric aggregation result");
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
