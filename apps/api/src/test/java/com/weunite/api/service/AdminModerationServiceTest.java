package com.weunite.api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import com.weunite.api.admin.moderation.dto.BanUserRequestDTO;
import com.weunite.api.admin.moderation.dto.ReactivateUserRequestDTO;
import com.weunite.api.admin.moderation.dto.SuspendUserRequestDTO;
import com.weunite.api.admin.moderation.service.AdminModerationService;
import com.weunite.api.common.exception.NotFoundResourceException;
import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.opportunities.repository.OpportunityRepository;
import com.weunite.api.posts.repository.CommentRepository;
import com.weunite.api.posts.repository.PostRepository;
import com.weunite.api.reports.domain.Report;
import com.weunite.api.reports.repository.ReportRepository;
import com.weunite.api.users.domain.Role;
import com.weunite.api.users.domain.User;
import com.weunite.api.users.repository.UserRepository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

@ExtendWith(MockitoExtension.class)
class AdminModerationServiceTest {

  @Mock private UserRepository userRepository;
  @Mock private PostRepository postRepository;
  @Mock private CommentRepository commentRepository;
  @Mock private OpportunityRepository opportunityRepository;
  @Mock private ReportRepository reportRepository;

  @InjectMocks private AdminModerationService adminModerationService;

  @Test
  @DisplayName("Should ban user and reuse a single timestamp for related reports")
  void banUserUsesSingleTimestamp() {
    User user = new User();
    user.setId(10L);
    user.setUsername("banned-user");

    Report pendingReport = new Report();
    pendingReport.setStatus(Report.ReportStatus.PENDING);

    when(userRepository.findById(10L)).thenReturn(Optional.of(user));
    when(reportRepository.findOpenContentReportsByUserId(
            10L,
            List.of(Report.ReportStatus.PENDING, Report.ReportStatus.REVIEWED),
            Report.ReportType.POST,
            Report.ReportType.COMMENT,
            Report.ReportType.OPPORTUNITY))
        .thenReturn(List.of(pendingReport));

    ResponseDTO<String> result =
        adminModerationService.banUser(new BanUserRequestDTO(10L, "spam"), 99L);

    assertNotNull(result);
    assertTrue(user.isBanned());
    assertEquals(user.getBannedAt(), pendingReport.getResolvedAt());
    assertEquals(Report.ActionTaken.USER_BANNED, pendingReport.getActionTaken());
    assertEquals(99L, pendingReport.getResolvedByAdminId());
    verify(userRepository).save(user);
    verify(reportRepository).saveAll(List.of(pendingReport));
  }

  @Test
  @DisplayName("Should build admin user summary with moderation metrics")
  void getUsersSummaryBuildsMetrics() {
    User user = new User();
    user.setId(12L);
    user.setName("Maria Santos");
    user.setUsername("maria");
    user.setEmail("maria@email.com");
    user.setSuspended(true);
    user.setRole(java.util.Set.of(new Role(4L, "ATHLETE")));

    when(userRepository.findUserIds(
            eq(""),
            eq("all"),
            any(Instant.class),
            eq(PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt")))))
        .thenReturn(new PageImpl<>(List.of(12L), PageRequest.of(0, 20), 42));
    when(userRepository.findAllWithRolesByIdIn(List.of(12L))).thenReturn(List.of(user));
    when(postRepository.countActivePostsByUserIds(List.of(12L)))
        .thenReturn(List.<Object[]>of(new Object[] {12L, 2L}));
    when(commentRepository.countActiveCommentsByUserIds(List.of(12L)))
        .thenReturn(List.<Object[]>of(new Object[] {12L, 3L}));
    when(opportunityRepository.countActiveOpportunitiesByCompanyIds(List.of(12L)))
        .thenReturn(List.of());
    when(reportRepository.countPendingPostReportsByUserIds(
            List.of(12L), Report.ReportStatus.PENDING, Report.ReportType.POST))
        .thenReturn(List.<Object[]>of(new Object[] {12L, 1L}));
    when(reportRepository.countPendingCommentReportsByUserIds(
            List.of(12L), Report.ReportStatus.PENDING, Report.ReportType.COMMENT))
        .thenReturn(List.<Object[]>of(new Object[] {12L, 2L}));
    when(reportRepository.countPendingOpportunityReportsByUserIds(
            List.of(12L), Report.ReportStatus.PENDING, Report.ReportType.OPPORTUNITY))
        .thenReturn(List.<Object[]>of(new Object[] {12L, 1L}));

    var result = adminModerationService.getUsersSummary(0, 20, "", "all");

    assertEquals(1, result.items().size());
    assertEquals(42, result.totalElements());
    assertEquals(3, result.totalPages());
    assertEquals("maria", result.items().get(0).username());
    assertEquals("athlete", result.items().get(0).role());
    assertEquals("suspended", result.items().get(0).status());
    assertEquals(5L, result.items().get(0).contentCount());
    assertEquals(4L, result.items().get(0).pendingReportCount());
  }

  @Test
  @DisplayName("Should throw when requested moderation report does not exist")
  void suspendUserRejectsMissingReport() {
    User user = new User();
    user.setId(20L);
    user.setUsername("suspended-user");

    when(userRepository.findById(20L)).thenReturn(Optional.of(user));
    when(reportRepository.findById(777L)).thenReturn(Optional.empty());

    NotFoundResourceException exception =
        assertThrows(
            NotFoundResourceException.class,
            () ->
                adminModerationService.suspendUser(
                    new SuspendUserRequestDTO(20L, 7, "abuse", 777L), 99L));

    assertTrue(exception.getMessage().contains("Report"));
    assertTrue(user.isSuspended());
    assertNotNull(user.getSuspendedUntil());
    verify(userRepository).save(user);
    verify(reportRepository).findById(777L);
    verifyNoMoreInteractions(reportRepository);
  }

  @Test
  @DisplayName("Should reactivate suspended and banned users")
  void reactivateUserClearsModerationFlags() {
    User user = new User();
    user.setId(30L);
    user.setUsername("reactivate-user");
    user.setBanned(true);
    user.setSuspended(true);
    user.setBannedReason("spam");
    user.setSuspensionReason("abuse");

    when(userRepository.findById(30L)).thenReturn(Optional.of(user));

    ResponseDTO<String> result =
        adminModerationService.reactivateUser(new ReactivateUserRequestDTO(30L), 99L);

    assertNotNull(result);
    assertFalse(user.isBanned());
    assertFalse(user.isSuspended());
    assertNull(user.getBannedReason());
    assertNull(user.getSuspensionReason());
    verify(userRepository).save(user);
  }
}
