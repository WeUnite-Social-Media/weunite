package com.weunite.api.reports.service;

import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.reports.domain.Report;
import com.weunite.api.reports.domain.ReportTarget;
import com.weunite.api.reports.dto.ReportDTO;
import com.weunite.api.reports.dto.ReportRequestDTO;
import com.weunite.api.reports.mapper.ReportMapper;
import com.weunite.api.reports.repository.ReportRepository;
import com.weunite.api.users.domain.User;
import com.weunite.api.users.exception.UserNotFoundException;
import com.weunite.api.users.repository.UserRepository;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReportService {

  private final ReportRepository reportRepository;
  private final UserRepository userRepository;
  private final ReportMapper reportMapper;

  public ReportService(
      ReportRepository reportRepository, UserRepository userRepository, ReportMapper reportMapper) {
    this.reportRepository = reportRepository;
    this.userRepository = userRepository;
    this.reportMapper = reportMapper;
  }

  @Transactional
  public ResponseDTO<ReportDTO> createReport(Long userId, ReportRequestDTO reportRequestDTO) {
    User user = userRepository.findById(userId).orElseThrow(UserNotFoundException::new);

    Report.ReportType type = Report.ReportType.valueOf(reportRequestDTO.type().toUpperCase());

    Report report = new Report(user, type, reportRequestDTO.entityId(), reportRequestDTO.reason());

    reportRepository.save(report);

    return reportMapper.toResponseDTO("Denúncia registrada com sucesso!", report);
  }

  @Transactional(readOnly = true)
  public List<ReportDTO> getAllPendingReports() {
    List<Report> reports = reportRepository.findAllPendingReports();
    return reportMapper.toReportDTOList(reports);
  }

  @Transactional(readOnly = true)
  public List<ReportDTO> getAllReports() {
    return reportMapper.toReportDTOList(reportRepository.findAllReports());
  }

  @Transactional(readOnly = true)
  public List<ReportDTO> getAllReportsByStatus(String status) {
    Report.ReportStatus reportStatus = Report.ReportStatus.valueOf(status.toUpperCase(Locale.ROOT));
    return reportMapper.toReportDTOList(reportRepository.findAllReportsByStatus(reportStatus));
  }

  @Transactional(readOnly = true)
  public Long getReportCount(Long entityId, String type) {
    Report.ReportType reportType = Report.ReportType.valueOf(type.toUpperCase(Locale.ROOT));
    return reportRepository.countByTargetAndStatus(
        new ReportTarget(reportType, entityId), Report.ReportStatus.PENDING);
  }
}
