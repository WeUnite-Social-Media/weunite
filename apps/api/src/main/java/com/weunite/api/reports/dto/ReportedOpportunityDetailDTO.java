package com.weunite.api.reports.dto;

import com.weunite.api.opportunities.dto.OpportunityDTO;
import java.util.List;

public record ReportedOpportunityDetailDTO(
    OpportunityDTO opportunity, List<ReportDTO> reports, Long totalReports, String status) {}
