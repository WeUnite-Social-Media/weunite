package com.example.weuniteauth.service;

import com.example.weuniteauth.domain.report.Report;
import com.example.weuniteauth.domain.users.User;
import com.example.weuniteauth.dto.ResponseDTO;
import com.example.weuniteauth.dto.report.ReportDTO;
import com.example.weuniteauth.dto.report.ReportRequestDTO;
import com.example.weuniteauth.dto.report.ReportSummaryDTO;
import com.example.weuniteauth.exceptions.user.UserNotFoundException;
import com.example.weuniteauth.mapper.ReportMapper;
import com.example.weuniteauth.repository.ReportRepository;
import com.example.weuniteauth.repository.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class    ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final ReportMapper reportMapper;

    public ReportService(ReportRepository reportRepository, UserRepository userRepository, ReportMapper reportMapper) {
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
        this.reportMapper = reportMapper;
    }

    @Transactional
    public ResponseDTO<ReportDTO> createReport(Long userId, ReportRequestDTO reportRequestDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(UserNotFoundException::new);

        Report.ReportType type = Report.ReportType.valueOf(reportRequestDTO.type().toUpperCase());

        Report report = new Report(
                user,
                type,
                reportRequestDTO.entityId(),
                reportRequestDTO.reason()
        );

        reportRepository.save(report);

        return reportMapper.toResponseDTO("Denúncia registrada com sucesso!", report);
    }

    @Transactional(readOnly = true)
    public List<ReportDTO> getAllPendingReports() {
        List<Report> reports = reportRepository.findAllPendingReports();
        return reportMapper.toReportDTOList(reports);
    }

    @Transactional(readOnly = true)
    public Long getReportCount(Long entityId, String type) {
        Report.ReportType reportType = Report.ReportType.valueOf(type.toUpperCase());
        return reportRepository.countByEntityIdAndTypeAndStatus(entityId, reportType, Report.ReportStatus.PENDING);
    }
}

