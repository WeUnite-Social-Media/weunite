package com.example.weuniteauth.service;

import com.example.weuniteauth.domain.opportunity.Skill;
import com.example.weuniteauth.dto.Opportunity.SkillRequestDTO;
import com.example.weuniteauth.dto.ResponseDTO;
import com.example.weuniteauth.dto.SkillDTO;
import com.example.weuniteauth.exceptions.opportunity.SkillAlreadyExistsException;
import com.example.weuniteauth.mapper.SkillMapper;
import com.example.weuniteauth.repository.SkillRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SkillService {

    private final SkillRepository skillRepository;
    private final SkillMapper skillMapper;

    public SkillService(SkillRepository skillRepository, SkillMapper skillMapper) {
        this.skillRepository = skillRepository;
        this.skillMapper = skillMapper;
    }

    public ResponseDTO<SkillDTO> createSkill (String skillName, SkillRequestDTO skillRequestDTO){
        Skill skill = skillRepository.findByName(skillName);
        if (skill != null) {
            throw new SkillAlreadyExistsException();
        }

        Skill newSkill = new Skill(skillRequestDTO.name());

        skillRepository.save(newSkill);

        return skillMapper.toResponseDTO("Skill criada com sucesso", newSkill);
    }

    public ResponseDTO<SkillDTO> getSkillByName(String skillName) {
        Skill skill = skillRepository.findByName(skillName);
        return skillMapper.toResponseDTO("Habilidade encontrada com sucesso", skill);
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
            throw new SkillAlreadyExistsException();
        }

        skillRepository.delete(skill);

        return skillMapper.toResponseDTO("Skill deletada com sucesso", skill);
    }
}
