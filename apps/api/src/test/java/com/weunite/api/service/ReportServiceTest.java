package com.weunite.api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.weunite.api.reports.domain.Report;
import com.weunite.api.reports.dto.ReportDTO;
import com.weunite.api.reports.mapper.ReportMapper;
import com.weunite.api.reports.repository.ReportRepository;
import com.weunite.api.reports.service.ReportService;
import com.weunite.api.users.repository.UserRepository;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

  @Mock private ReportRepository reportRepository;

  @Mock private UserRepository userRepository;

  @Mock private ReportMapper reportMapper;

  @InjectMocks private ReportService reportService;

  @Test
  @DisplayName("Should return all reports ordered by creation date")
  void getAllReports_Success() {
    Report report = new Report();
    report.setId(1L);

    ReportDTO reportDTO = new ReportDTO("1", null, "POST", 10L, "Spam", "pending", Instant.now());

    when(reportRepository.findAllReports()).thenReturn(List.of(report));
    when(reportMapper.toReportDTOList(List.of(report))).thenReturn(List.of(reportDTO));

    List<ReportDTO> result = reportService.getAllReports();

    assertEquals(List.of(reportDTO), result);
    verify(reportRepository).findAllReports();
    verify(reportMapper).toReportDTOList(List.of(report));
  }

  @Test
  @DisplayName("Should return reports filtered by status")
  void getAllReportsByStatus_Success() {
    Report report = new Report();
    report.setId(2L);
    report.setStatus(Report.ReportStatus.RESOLVED);

    ReportDTO reportDTO =
        new ReportDTO("2", null, "COMMENT", 99L, "Resolved", "resolved", Instant.now());

    when(reportRepository.findAllReportsByStatus(Report.ReportStatus.RESOLVED))
        .thenReturn(List.of(report));
    when(reportMapper.toReportDTOList(List.of(report))).thenReturn(List.of(reportDTO));

    List<ReportDTO> result = reportService.getAllReportsByStatus("resolved");

    assertEquals(List.of(reportDTO), result);
    verify(reportRepository).findAllReportsByStatus(Report.ReportStatus.RESOLVED);
    verify(reportMapper).toReportDTOList(List.of(report));
  }
}
