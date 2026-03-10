package com.example.weuniteauth.repository;

import com.example.weuniteauth.domain.opportunity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SkillRepository extends JpaRepository<Skill, Long> {

    Skill findByName(String name);

    List<Skill> findByAthleteUsername(String username);

    List<Skill> findAllByName(String name);

    List<Skill> findByOpportunitiesTitle(String title);
}
