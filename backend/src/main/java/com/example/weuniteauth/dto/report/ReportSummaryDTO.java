package com.example.weuniteauth.dto.report;

public record ReportSummaryDTO(
        Long entityId,
        String entityType,
        Long reportCount
) {
}

