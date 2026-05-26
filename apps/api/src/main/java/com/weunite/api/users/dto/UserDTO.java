package com.weunite.api.users.dto;

import com.weunite.api.opportunities.dto.SkillDTO;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record UserDTO(
    String id,
    String name,
    String username,
    String role,
    String bio,
    String email,
    String profileImg,
    String bannerImg,
    boolean isPrivate,
    Instant createdAt,
    Instant updatedAt,
    String cnpj,
    Double height,
    Double weight,
    String footDomain,
    String position,
    LocalDate birthDate,
    List<SkillDTO> skills) {

  public UserDTO(
      String id,
      String name,
      String username,
      String role,
      String bio,
      String email,
      String profileImg,
      String bannerImg,
      boolean isPrivate,
      Instant createdAt,
      Instant updatedAt) {
    this(
        id,
        name,
        username,
        role,
        bio,
        email,
        profileImg,
        bannerImg,
        isPrivate,
        createdAt,
        updatedAt,
        null,
        null,
        null,
        null,
        null,
        null,
        List.of());
  }
}
