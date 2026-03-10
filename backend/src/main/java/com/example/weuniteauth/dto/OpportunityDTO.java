package com.example.weuniteauth.dto;

import com.example.weuniteauth.domain.opportunity.Skill;
import com.example.weuniteauth.domain.users.Company;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Set;

public record   OpportunityDTO(
        Long id,
        String title,
        String description,
        String location,
        LocalDate dateEnd,
        Set<Skill> skills,
        Instant createdAt,
        Instant updatedAt,
        UserDTO company
) {
}
