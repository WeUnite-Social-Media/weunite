package com.weunite.api.admin.stats.dto;

import java.util.List;
import java.util.Objects;

public final class OpportunityCategoryWithSkillsDTO {

  private final String category;
  private final Long count;
  private final List<OpportunitySkillDTO> topSkills;

  public OpportunityCategoryWithSkillsDTO(
      String category, Long count, List<OpportunitySkillDTO> topSkills) {
    this.category = category;
    this.count = count;
    this.topSkills = topSkills;
  }

  public String getCategory() {
    return category;
  }

  public String category() {
    return category;
  }

  public Long getCount() {
    return count;
  }

  public Long count() {
    return count;
  }

  public List<OpportunitySkillDTO> getTopSkills() {
    return topSkills;
  }

  public List<OpportunitySkillDTO> topSkills() {
    return topSkills;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (!(o instanceof OpportunityCategoryWithSkillsDTO that)) {
      return false;
    }
    return Objects.equals(category, that.category)
        && Objects.equals(count, that.count)
        && Objects.equals(topSkills, that.topSkills);
  }

  @Override
  public int hashCode() {
    return Objects.hash(category, count, topSkills);
  }
}
