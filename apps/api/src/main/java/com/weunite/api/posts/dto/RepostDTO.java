package com.weunite.api.posts.dto;

import com.weunite.api.users.dto.UserDTO;

public record RepostDTO(String id, UserDTO user, PostDTO post) {}
