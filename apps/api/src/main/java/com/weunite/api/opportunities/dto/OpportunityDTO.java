package com.weunite.api.opportunities.dto;

import com.weunite.api.opportunities.domain.Skill;
import com.weunite.api.users.dto.UserDTO;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Set;

public record OpportunityDTO(
    Long id,
    String title,
    String description,
    String location,
    LocalDate dateEnd,
    Set<Skill> skills,
    Instant createdAt,
    Instant updatedAt,
    UserDTO company,
    Integer subscribersCount) {

  public OpportunityDTO(
      Long id,
      String title,
      String description,
      String location,
      LocalDate dateEnd,
      Set<Skill> skills,
      Instant createdAt,
      Instant updatedAt,
      UserDTO company) {
    this(id, title, description, location, dateEnd, skills, createdAt, updatedAt, company, 0);
  }
}
