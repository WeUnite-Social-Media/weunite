package com.example.weuniteauth.dto.report;

import com.example.weuniteauth.dto.UserDTO;

import java.time.Instant;

public record ReportDTO(
        String id,
        UserDTO reporter,
        String type,
        Long entityId,
        String reason,
        String status,
        Instant createdAt
) {
}

