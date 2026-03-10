package com.example.weuniteauth.dto.Opportunity;

import com.example.weuniteauth.domain.opportunity.Skill;
import com.example.weuniteauth.domain.users.Company;
import com.example.weuniteauth.validations.ValidOpportunity;

import java.time.LocalDate;
import java.util.Set;


@ValidOpportunity
public record OpportunityRequestDTO(
        String title,
        String description,
        String location,
        LocalDate dateEnd,
        Set<Skill> skills
) {

}
