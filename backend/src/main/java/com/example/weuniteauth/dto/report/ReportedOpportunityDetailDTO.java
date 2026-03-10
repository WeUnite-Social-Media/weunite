package com.example.weuniteauth.dto.report;

import com.example.weuniteauth.dto.OpportunityDTO;

import java.util.List;

public record ReportedOpportunityDetailDTO(
        OpportunityDTO opportunity,
        List<ReportDTO> reports,
        Long totalReports,
        String status
) {
}
