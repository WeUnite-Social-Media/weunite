package com.weunite.api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import com.weunite.api.admin.moderation.dto.BanUserRequestDTO;
import com.weunite.api.admin.moderation.dto.SuspendUserRequestDTO;
import com.weunite.api.admin.moderation.service.AdminModerationService;
import com.weunite.api.common.exception.NotFoundResourceException;
import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.reports.domain.Report;
import com.weunite.api.reports.repository.ReportRepository;
import com.weunite.api.users.domain.User;
import com.weunite.api.users.repository.UserRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AdminModerationServiceTest {

  @Mock private UserRepository userRepository;
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
    when(reportRepository.findPendingReportsByUser(user)).thenReturn(List.of(pendingReport));

    ResponseDTO<String> result =
        adminModerationService.banUser(new BanUserRequestDTO(10L, "spam", 99L));

    assertNotNull(result);
    assertTrue(user.isBanned());
    assertEquals(user.getBannedAt(), pendingReport.getResolvedAt());
    assertEquals(Report.ActionTaken.USER_BANNED, pendingReport.getActionTaken());
    assertEquals(99L, pendingReport.getResolvedByAdminId());
    verify(userRepository).save(user);
    verify(reportRepository).saveAll(List.of(pendingReport));
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
                    new SuspendUserRequestDTO(20L, 7, "abuse", 777L, 99L)));

    assertTrue(exception.getMessage().contains("Report"));
    assertTrue(user.isSuspended());
    assertNotNull(user.getSuspendedUntil());
    verify(userRepository).save(user);
    verify(reportRepository).findById(777L);
    verifyNoMoreInteractions(reportRepository);
  }
}
