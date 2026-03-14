package com.weunite.api.opportunities.repository;

import com.weunite.api.opportunities.domain.Skill;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SkillRepository extends JpaRepository<Skill, Long> {

  Skill findByName(String name);

  List<Skill> findByAthleteUsername(String username);

  List<Skill> findAllByName(String name);

  List<Skill> findByOpportunitiesTitle(String title);
}
