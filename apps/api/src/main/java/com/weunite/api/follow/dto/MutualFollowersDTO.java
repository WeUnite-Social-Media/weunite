package com.weunite.api.follow.dto;

import com.weunite.api.users.dto.UserDTO;
import java.util.List;

public record MutualFollowersDTO(long total, List<UserDTO> users) {}
