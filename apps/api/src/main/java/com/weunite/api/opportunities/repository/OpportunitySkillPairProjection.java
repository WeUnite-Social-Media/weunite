package com.weunite.api.opportunities.repository;

public interface OpportunitySkillPairProjection {

  String getSkillName();

  String getRelatedSkillName();

  Long getOpportunityCount();
}
