package com.example.weuniteauth.dto.report;

import com.example.weuniteauth.dto.PostDTO;

import java.util.List;

public record ReportedPostDetailDTO(
        PostDTO post,
        List<ReportDTO> reports,
        Long totalReports,
        String status
) {
}
