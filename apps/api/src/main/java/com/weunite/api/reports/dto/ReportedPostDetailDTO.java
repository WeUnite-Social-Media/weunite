package com.weunite.api.reports.dto;

import com.weunite.api.posts.dto.PostDTO;
import java.util.List;

public record ReportedPostDetailDTO(
    PostDTO post, List<ReportDTO> reports, Long totalReports, String status) {}
