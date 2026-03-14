package com.weunite.api.opportunities.dto;

import com.weunite.api.opportunities.domain.Opportunity;
import com.weunite.api.users.domain.Athlete;

public record SubscriberDTO(Long id, Athlete athlete, Opportunity opportunity) {}
