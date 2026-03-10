package com.example.weuniteauth.controller;

import com.example.weuniteauth.dto.ResponseDTO;
import com.example.weuniteauth.dto.report.ReportDTO;
import com.example.weuniteauth.dto.report.ReportRequestDTO;
import com.example.weuniteauth.service.ReportService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@Validated
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping("/create/{userId}")
    public ResponseEntity<ResponseDTO<ReportDTO>> createReport(
            @PathVariable Long userId,
            @RequestBody @Valid ReportRequestDTO reportRequestDTO) {
        ResponseDTO<ReportDTO> report = reportService.createReport(userId, reportRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(report);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<ReportDTO>> getAllPendingReports() {
        List<ReportDTO> reports = reportService.getAllPendingReports();
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/count/{entityId}/{type}")
    public ResponseEntity<Long> getReportCount(
            @PathVariable Long entityId,
            @PathVariable String type) {
        Long count = reportService.getReportCount(entityId, type);
        return ResponseEntity.ok(count);
    }
}

