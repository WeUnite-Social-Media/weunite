package com.weunite.api.reports.controller;

import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.common.security.service.AuthenticatedUserService;
import com.weunite.api.reports.dto.ReportDTO;
import com.weunite.api.reports.dto.ReportRequestDTO;
import com.weunite.api.reports.service.ReportService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@Validated
public class ReportController {

  private final ReportService reportService;
  private final AuthenticatedUserService authenticatedUserService;

  public ReportController(
      ReportService reportService, AuthenticatedUserService authenticatedUserService) {
    this.reportService = reportService;
    this.authenticatedUserService = authenticatedUserService;
  }

  @PostMapping("/create/{userId}")
  public ResponseEntity<ResponseDTO<ReportDTO>> createReport(
      @AuthenticationPrincipal Jwt jwt,
      @PathVariable Long userId,
      @RequestBody @Valid ReportRequestDTO reportRequestDTO) {
    Long authenticatedUserId = authenticatedUserService.requireMatchingUserId(jwt, userId);
    ResponseDTO<ReportDTO> report =
        reportService.createReport(authenticatedUserId, reportRequestDTO);
    return ResponseEntity.status(HttpStatus.CREATED).body(report);
  }

  @GetMapping("/pending")
  public ResponseEntity<List<ReportDTO>> getAllPendingReports() {
    List<ReportDTO> reports = reportService.getAllPendingReports();
    return ResponseEntity.ok(reports);
  }

  @GetMapping("/all")
  public ResponseEntity<List<ReportDTO>> getAllReports() {
    List<ReportDTO> reports = reportService.getAllReports();
    return ResponseEntity.ok(reports);
  }

  @GetMapping("/status/{status}")
  public ResponseEntity<List<ReportDTO>> getAllReportsByStatus(@PathVariable String status) {
    List<ReportDTO> reports = reportService.getAllReportsByStatus(status);
    return ResponseEntity.ok(reports);
  }

  @GetMapping("/count/{entityId}/{type}")
  public ResponseEntity<Long> getReportCount(
      @PathVariable Long entityId, @PathVariable String type) {
    Long count = reportService.getReportCount(entityId, type);
    return ResponseEntity.ok(count);
  }
}
