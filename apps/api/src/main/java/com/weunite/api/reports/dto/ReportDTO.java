package com.weunite.api.reports.dto;

import com.weunite.api.users.dto.UserDTO;
import java.time.Instant;

public record ReportDTO(
    String id,
    UserDTO reporter,
    String type,
    Long entityId,
    String reason,
    String status,
    Instant createdAt) {}
