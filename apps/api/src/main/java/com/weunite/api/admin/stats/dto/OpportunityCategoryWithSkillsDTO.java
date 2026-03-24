package com.weunite.api.admin.stats.dto;

import java.util.List;

public record OpportunityCategoryWithSkillsDTO(
    String category, Long count, List<String> topSkills) {}
