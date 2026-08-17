package com.weunite.api.reports.controller;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.common.security.service.AuthenticatedUserService;
import com.weunite.api.reports.dto.ReportDTO;
import com.weunite.api.reports.dto.ReportRequestDTO;
import com.weunite.api.reports.service.ReportService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;

@ExtendWith(MockitoExtension.class)
class ReportControllerTest {

  @Mock private ReportService reportService;
  @Mock private AuthenticatedUserService authenticatedUserService;

  @InjectMocks private ReportController reportController;

  @Test
  @DisplayName("Should use the authenticated reporter when creating reports")
  void createReportUsesAuthenticatedReporter() {
    Jwt jwt = mock(Jwt.class);
    ReportRequestDTO request = new ReportRequestDTO("POST", 22L, "Spam");
    ResponseDTO<ReportDTO> expected = new ResponseDTO<>("ok", null);

    when(authenticatedUserService.requireMatchingUserId(jwt, 11L)).thenReturn(11L);
    when(reportService.createReport(11L, request)).thenReturn(expected);

    ResponseEntity<ResponseDTO<ReportDTO>> result =
        reportController.createReport(jwt, 11L, request);

    assertSame(expected, result.getBody());
    verify(reportService).createReport(11L, request);
  }
}
