package com.weunite.api.users.service;

import com.weunite.api.opportunities.domain.Skill;
import com.weunite.api.opportunities.dto.SkillDTO;
import com.weunite.api.opportunities.repository.SkillRepository;
import com.weunite.api.users.domain.Athlete;
import com.weunite.api.users.domain.AthleteProfile;
import com.weunite.api.users.dto.UpdateUserRequestDTO;
import com.weunite.api.users.repository.AthleteProfileRepository;
import java.time.LocalDate;
import java.util.LinkedHashSet;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class AthleteProfileService {

  private final SkillRepository skillRepository;
  private final AthleteProfileRepository athleteProfileRepository;

  public AthleteProfileService(
      SkillRepository skillRepository, AthleteProfileRepository athleteProfileRepository) {
    this.skillRepository = skillRepository;
    this.athleteProfileRepository = athleteProfileRepository;
  }

  public void applyProfileUpdates(Athlete athlete, UpdateUserRequestDTO requestDTO) {
    athlete.setHeight(requestDTO.height());
    athlete.setWeight(requestDTO.weight());
    athlete.setFootDomain(blankToNull(requestDTO.footDomain()));
    athlete.setPosition(blankToNull(requestDTO.position()));
    athlete.setBirthDate(requestDTO.birthDate());

    if (requestDTO.skills() != null) {
      athlete.setSkills(resolveSkills(requestDTO.skills()));
    }

    athleteProfileRepository.save(athlete.ensureProfile());
  }

  public Double resolveHeight(Athlete athlete) {
    AthleteProfile profile = athlete.getProfile();
    return profile != null ? profile.getHeight() : athlete.getHeight();
  }

  public Double resolveWeight(Athlete athlete) {
    AthleteProfile profile = athlete.getProfile();
    return profile != null ? profile.getWeight() : athlete.getWeight();
  }

  public String resolveFootDomain(Athlete athlete) {
    AthleteProfile profile = athlete.getProfile();
    return profile != null ? profile.getFootDomain() : athlete.getFootDomain();
  }

  public String resolvePosition(Athlete athlete) {
    AthleteProfile profile = athlete.getProfile();
    return profile != null ? profile.getPosition() : athlete.getPosition();
  }

  public LocalDate resolveBirthDate(Athlete athlete) {
    AthleteProfile profile = athlete.getProfile();
    return profile != null ? profile.getBirthDate() : athlete.getBirthDate();
  }

  private LinkedHashSet<Skill> resolveSkills(List<SkillDTO> requestedSkills) {
    LinkedHashSet<Skill> resolvedSkills = new LinkedHashSet<>();

    for (SkillDTO requestedSkill : requestedSkills) {
      String skillName = blankToNull(requestedSkill.name());
      if (skillName == null) {
        continue;
      }

      Skill existingSkill = skillRepository.findByName(skillName);
      if (existingSkill != null) {
        resolvedSkills.add(existingSkill);
        continue;
      }

      resolvedSkills.add(skillRepository.save(new Skill(skillName)));
    }

    return resolvedSkills;
  }

  private String blankToNull(String value) {
    if (value == null) {
      return null;
    }

    String trimmedValue = value.trim();
    return trimmedValue.isEmpty() ? null : trimmedValue;
  }
}
