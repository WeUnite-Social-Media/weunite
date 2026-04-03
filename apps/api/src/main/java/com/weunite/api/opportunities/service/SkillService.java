package com.weunite.api.opportunities.service;

import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.opportunities.domain.Skill;
import com.weunite.api.opportunities.dto.SkillDTO;
import com.weunite.api.opportunities.dto.SkillRequestDTO;
import com.weunite.api.opportunities.exception.SkillAlreadyExistsException;
import com.weunite.api.opportunities.exception.SkillNotFoundException;
import com.weunite.api.opportunities.mapper.SkillMapper;
import com.weunite.api.opportunities.repository.SkillRepository;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class SkillService {

  private final SkillRepository skillRepository;
  private final SkillMapper skillMapper;

  public SkillService(SkillRepository skillRepository, SkillMapper skillMapper) {
    this.skillRepository = skillRepository;
    this.skillMapper = skillMapper;
  }

  public ResponseDTO<SkillDTO> createSkill(String skillName, SkillRequestDTO skillRequestDTO) {
    Skill skill = skillRepository.findByName(skillName);
    if (skill != null) {
      throw new SkillAlreadyExistsException();
    }

    Skill newSkill = new Skill(skillRequestDTO.name());

    skillRepository.save(newSkill);

    return skillMapper.toResponseDTO("Habilidade criada com sucesso", newSkill);
  }

  public ResponseDTO<SkillDTO> getSkillByName(String skillName) {
    Skill skill = skillRepository.findByName(skillName);
    if (skill == null) {
      throw new SkillNotFoundException();
    }

    return skillMapper.toResponseDTO("Habilidade encontrada com sucesso", skill);
  }

  public List<SkillDTO> getAllSkills() {
    List<Skill> skills = skillRepository.findAll(Sort.by(Sort.Direction.ASC, "name"));

    return skillMapper.toSkillDTOList(skills);
  }

  public List<SkillDTO> getSkillsAthlete(String username) {
    List<Skill> skills = skillRepository.findByAthleteUsername(username);

    return skillMapper.toSkillDTOList(skills);
  }

  public List<SkillDTO> getSkillsOpportunity(String title) {
    List<Skill> skills = skillRepository.findByOpportunitiesTitle(title);

    return skillMapper.toSkillDTOList(skills);
  }

  public ResponseDTO<SkillDTO> deleteSkill(String skillName) {
    Skill skill = skillRepository.findByName(skillName);
    if (skill == null) {
      throw new SkillNotFoundException();
    }

    skillRepository.delete(skill);

    return skillMapper.toResponseDTO("Habilidade deletada com sucesso", skill);
  }
}
