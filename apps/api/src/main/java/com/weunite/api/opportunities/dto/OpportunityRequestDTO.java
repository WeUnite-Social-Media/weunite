package com.weunite.api.opportunities.dto;

import com.weunite.api.common.validation.ValidOpportunity;
import com.weunite.api.opportunities.domain.Skill;
import java.time.LocalDate;
import java.util.Set;

@ValidOpportunity
public record OpportunityRequestDTO(
    String title, String description, String location, LocalDate dateEnd, Set<Skill> skills) {}
