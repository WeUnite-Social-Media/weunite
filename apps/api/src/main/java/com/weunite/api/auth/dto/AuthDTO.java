package com.weunite.api.auth.dto;

import com.weunite.api.users.dto.UserDTO;

public record AuthDTO(UserDTO user, String jwt, Long expiresIn) {}
