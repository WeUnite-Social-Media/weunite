package com.weunite.api.reports.dto;

import com.weunite.api.posts.dto.CommentDTO;
import java.util.List;

public record ReportedCommentDetailDTO(
    CommentDTO comment, List<ReportDTO> reports, Long totalReports, String status) {}
