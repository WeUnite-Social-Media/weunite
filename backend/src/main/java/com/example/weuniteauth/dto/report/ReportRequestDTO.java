package com.example.weuniteauth.dto.report;

public record ReportRequestDTO(
        String type,
        Long entityId,
        String reason
) {
}

