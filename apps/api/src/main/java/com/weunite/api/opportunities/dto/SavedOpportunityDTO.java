package com.weunite.api.opportunities.dto;

import java.time.Instant;

public record SavedOpportunityDTO(
    Long id, Long athleteId, OpportunityDTO opportunity, Instant savedAt) {}
