package com.example.weuniteauth.service;

import com.example.weuniteauth.domain.opportunity.Opportunity;
import com.example.weuniteauth.domain.opportunity.Skill;
import com.example.weuniteauth.domain.users.Company;
import com.example.weuniteauth.domain.users.User;
import com.example.weuniteauth.dto.Opportunity.OpportunityRequestDTO;
import com.example.weuniteauth.dto.ResponseDTO;
import com.example.weuniteauth.dto.OpportunityDTO;
import com.example.weuniteauth.exceptions.UnauthorizedException;
import com.example.weuniteauth.exceptions.opportunity.OpportunityNotFoundException;
import com.example.weuniteauth.exceptions.user.UserNotFoundException;
import com.example.weuniteauth.mapper.OpportunityMapper;
import com.example.weuniteauth.repository.CompanyRepository;
import com.example.weuniteauth.repository.OpportunityRepository;
import com.example.weuniteauth.repository.SkillRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class OpportunityService {

    private final CompanyRepository companyRepository;
    private final OpportunityRepository opportunityRepository;
    private final OpportunityMapper opportunityMapper;
    private final SkillRepository skillRepository;

    public OpportunityService(CompanyRepository companyRepository, OpportunityRepository opportunityRepository, OpportunityMapper opportunityMapper, SkillRepository skillRepository) {
        this.companyRepository = companyRepository;
        this.opportunityRepository = opportunityRepository;
        this.opportunityMapper = opportunityMapper;
        this.skillRepository = skillRepository;
    }

    @Transactional
    public ResponseDTO<OpportunityDTO> createOpportunity(Long companyId, OpportunityRequestDTO opportunityDTO) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(UserNotFoundException::new);

        Opportunity createdOpportunity = new Opportunity(
                company,
                opportunityDTO.title(),
                opportunityDTO.description(),
                opportunityDTO.location(),
                opportunityDTO.dateEnd(),
                opportunityDTO.skills().stream()
                        .map(skill -> {
                            Skill existingSkill = skillRepository.findByName(skill.getName());
                            if (existingSkill != null) {
                                return existingSkill;
                            } else {
                                Skill newSkill = new Skill(skill.getName());
                                skillRepository.save(newSkill);
                                return newSkill;
                            }
                        })
                        .collect(Collectors.toSet())
        );

        opportunityRepository.save(createdOpportunity);

        return opportunityMapper.toResponseDTO("Oportunidade criada com sucesso!", createdOpportunity);
    }

    @Transactional
    public ResponseDTO<OpportunityDTO> updateOpportunity(Long userId, Long opportunityId, OpportunityDTO updatedOpportunityDTO) {
        Opportunity existingOpportunity = opportunityRepository.findById(opportunityId)
                .orElseThrow(OpportunityNotFoundException::new);

        if (!userId.equals(existingOpportunity.getCompany().getId())) {
            throw new UnauthorizedException("Você não possui autorização para atualizar esta oportunidade.");
        }

        existingOpportunity.setTitle(updatedOpportunityDTO.title());
        existingOpportunity.setDescription(updatedOpportunityDTO.description());
        existingOpportunity.setLocation(updatedOpportunityDTO.location());
        existingOpportunity.setDateEnd(updatedOpportunityDTO.dateEnd());

        existingOpportunity.getSkills().clear();

        updatedOpportunityDTO.skills().forEach(skillDTO -> {
            Skill skill = skillRepository.findByName(skillDTO.getName());
            if (skill == null) {
                skill = new Skill(skillDTO.getName());
                skillRepository.save(skill);
            }
            existingOpportunity.addSkill(skill);
        });

        opportunityRepository.save(existingOpportunity);

        return opportunityMapper.toResponseDTO("Oportunidade atualizada com sucesso!", existingOpportunity);
    }

    @Transactional
    public ResponseDTO<OpportunityDTO> deleteOpportunity(Long userId, Long opportunityId) {
        Opportunity existingOpportunity = opportunityRepository.findById(opportunityId)
                .orElseThrow(OpportunityNotFoundException::new);

        if (!userId.equals(existingOpportunity.getCompany().getId())) {
            throw new UnauthorizedException("Você não possui autorização para deletar esta oportunidade.");
        }

        opportunityRepository.delete(existingOpportunity);

        return opportunityMapper.toResponseDTO("Oportunidade deletada com sucesso!", existingOpportunity);

    }

    @Transactional
    public ResponseDTO<OpportunityDTO> getOpportunity(Long opportunityId) {
        Opportunity opportunity = opportunityRepository.findById(opportunityId)
                .orElseThrow(OpportunityNotFoundException::new);

        return opportunityMapper.toResponseDTO("Oportunidade encontrada com sucesso!", opportunity);

    }

    @Transactional
    public List<OpportunityDTO> getOpportunities() {

        List<Opportunity> opportunities = opportunityRepository.findAllOrderedByCreationDate();

        return opportunityMapper.toOpportunityDTOList(opportunities);
    }

    @Transactional
    public List<OpportunityDTO> getOpportunitiesByCompanyId(Long userId) {
        User user = companyRepository.findById(userId)
                .orElseThrow(UserNotFoundException::new);

        List<Opportunity> opportunities = opportunityRepository.findByCompanyId(userId);
        return opportunityMapper.toOpportunityDTOList(opportunities);
    }

}
