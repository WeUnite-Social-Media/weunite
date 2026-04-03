package com.weunite.api.opportunities.dto;

import com.weunite.api.users.dto.UserDTO;

public record SubscriberDTO(Long id, UserDTO athlete, OpportunityDTO opportunity) {}
