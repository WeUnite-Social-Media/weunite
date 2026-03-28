package com.weunite.api.admin.stats.dto;

import java.util.List;

public record OpportunityCategoryWithSkillsDTO(
    String category, Long count, List<OpportunitySkillDTO> topSkills) {

  public String getCategory() {
    return category;
  }

  public Long getCount() {
    return count;
  }

  public List<OpportunitySkillDTO> getTopSkills() {
    return topSkills;
  }
}
