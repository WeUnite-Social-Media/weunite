package com.example.weuniteauth.dto.Opportunity;

import com.example.weuniteauth.domain.opportunity.Opportunity;
import com.example.weuniteauth.domain.users.Athlete;

public record SubscriberDTO(
        Long id,
        Athlete athlete,
        Opportunity opportunity
) {
}

