package com.weunite.api.opportunities.service;

import com.weunite.api.common.exception.BusinessRuleException;
import com.weunite.api.common.exception.UnauthorizedException;
import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.opportunities.domain.Opportunity;
import com.weunite.api.opportunities.domain.Skill;
import com.weunite.api.opportunities.dto.OpportunityDTO;
import com.weunite.api.opportunities.dto.OpportunityRequestDTO;
import com.weunite.api.opportunities.exception.OpportunityNotFoundException;
import com.weunite.api.opportunities.mapper.OpportunityMapper;
import com.weunite.api.opportunities.repository.OpportunityRepository;
import com.weunite.api.opportunities.repository.SavedOpportunityRepository;
import com.weunite.api.opportunities.repository.SkillRepository;
import com.weunite.api.opportunities.repository.SubscribersRepository;
import com.weunite.api.users.domain.Company;
import com.weunite.api.users.exception.UserNotFoundException;
import com.weunite.api.users.repository.CompanyRepository;
import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
public class OpportunityService {

  private final CompanyRepository companyRepository;
  private final OpportunityRepository opportunityRepository;
  private final SavedOpportunityRepository savedOpportunityRepository;
  private final SubscribersRepository subscribersRepository;
  private final OpportunityMapper opportunityMapper;
  private final SkillRepository skillRepository;

  public OpportunityService(
      CompanyRepository companyRepository,
      OpportunityRepository opportunityRepository,
      SavedOpportunityRepository savedOpportunityRepository,
      SubscribersRepository subscribersRepository,
      OpportunityMapper opportunityMapper,
      SkillRepository skillRepository) {
    this.companyRepository = companyRepository;
    this.opportunityRepository = opportunityRepository;
    this.savedOpportunityRepository = savedOpportunityRepository;
    this.subscribersRepository = subscribersRepository;
    this.opportunityMapper = opportunityMapper;
    this.skillRepository = skillRepository;
  }

  @Transactional
  public ResponseDTO<OpportunityDTO> createOpportunity(
      Long companyId, OpportunityRequestDTO opportunityDTO) {
    Company company = companyRepository.findById(companyId).orElseThrow(UserNotFoundException::new);
    validateOpportunityRequest(opportunityDTO);

    Opportunity createdOpportunity =
        new Opportunity(
            company,
            opportunityDTO.title(),
            opportunityDTO.description(),
            opportunityDTO.location(),
            opportunityDTO.dateEnd(),
            opportunityDTO.skills().stream()
                .map(
                    skill -> {
                      Skill existingSkill = skillRepository.findByName(skill.getName());
                      if (existingSkill != null) {
                        return existingSkill;
                      }

                      Skill newSkill = new Skill(skill.getName());
                      skillRepository.save(newSkill);
                      return newSkill;
                    })
                .collect(Collectors.toSet()));

    opportunityRepository.save(createdOpportunity);

    return opportunityMapper.toResponseDTO("Oportunidade criada com sucesso!", createdOpportunity);
  }

  @Transactional
  public ResponseDTO<OpportunityDTO> updateOpportunity(
      Long userId, Long opportunityId, OpportunityRequestDTO updatedOpportunityDTO) {
    validateOpportunityRequest(updatedOpportunityDTO);

    Opportunity existingOpportunity =
        opportunityRepository
            .findByIdAndDeletedFalse(opportunityId)
            .orElseThrow(OpportunityNotFoundException::new);

    if (!userId.equals(existingOpportunity.getCompany().getId())) {
      throw new UnauthorizedException(
          "Voce nao possui autorizacao para atualizar esta oportunidade.");
    }

    existingOpportunity.setTitle(updatedOpportunityDTO.title());
    existingOpportunity.setDescription(updatedOpportunityDTO.description());
    existingOpportunity.setLocation(updatedOpportunityDTO.location());
    existingOpportunity.setDateEnd(updatedOpportunityDTO.dateEnd());

    existingOpportunity.getSkills().clear();

    updatedOpportunityDTO
        .skills()
        .forEach(
            skillDTO -> {
              Skill skill = skillRepository.findByName(skillDTO.getName());
              if (skill == null) {
                skill = new Skill(skillDTO.getName());
                skillRepository.save(skill);
              }
              existingOpportunity.addSkill(skill);
            });

    opportunityRepository.save(existingOpportunity);

    return opportunityMapper.toResponseDTO(
        "Oportunidade atualizada com sucesso!", existingOpportunity);
  }

  @Transactional
  public ResponseDTO<OpportunityDTO> deleteOpportunity(Long userId, Long opportunityId) {
    Opportunity existingOpportunity =
        opportunityRepository
            .findByIdAndDeletedFalse(opportunityId)
            .orElseThrow(OpportunityNotFoundException::new);

    if (!userId.equals(existingOpportunity.getCompany().getId())) {
      throw new UnauthorizedException(
          "Voce nao possui autorizacao para deletar esta oportunidade.");
    }

    savedOpportunityRepository.deleteByOpportunityId(opportunityId);
    subscribersRepository.deleteByOpportunityId(opportunityId);
    opportunityRepository.delete(existingOpportunity);

    return opportunityMapper.toResponseDTO(
        "Oportunidade deletada com sucesso!", existingOpportunity);
  }

  @Transactional
  public ResponseDTO<OpportunityDTO> getOpportunity(Long opportunityId) {
    Opportunity opportunity =
        opportunityRepository
            .findReadModelByIdAndDeletedFalse(opportunityId)
            .orElseThrow(OpportunityNotFoundException::new);

    return opportunityMapper.toResponseDTO("Oportunidade encontrada com sucesso!", opportunity);
  }

  @Transactional
  public List<OpportunityDTO> getOpportunities() {
    return getOpportunities(0, 10);
  }

  @Transactional
  public List<OpportunityDTO> getOpportunities(int page, int size) {
    PageRequest pageable = pageRequest(page, size);
    List<Opportunity> opportunities =
        opportunityRepository.findAllActiveForReadModelOrderedByCreationDate(pageable).getContent();
    return opportunityMapper.toOpportunityDTOList(opportunities);
  }

  @Transactional
  public List<OpportunityDTO> getOpportunitiesByCompanyId(Long userId) {
    return getOpportunitiesByCompanyId(userId, 0, 10);
  }

  @Transactional
  public List<OpportunityDTO> getOpportunitiesByCompanyId(Long userId, int page, int size) {
    companyRepository.findById(userId).orElseThrow(UserNotFoundException::new);

    List<Opportunity> opportunities =
        opportunityRepository
            .findActiveReadModelsByCompanyId(userId, pageRequest(page, size))
            .getContent();
    return opportunityMapper.toOpportunityDTOList(opportunities);
  }

  private PageRequest pageRequest(int page, int size) {
    int safePage = Math.max(page, 0);
    int safeSize = Math.min(Math.max(size, 1), 100);
    return PageRequest.of(safePage, safeSize);
  }

  private void validateOpportunityRequest(OpportunityRequestDTO opportunityDTO) {
    if (opportunityDTO == null) {
      throw new BusinessRuleException("Dados da oportunidade sao obrigatorios");
    }

    LocalDate dateEnd = opportunityDTO.dateEnd();
    if (dateEnd == null) {
      throw new BusinessRuleException("A data de termino e obrigatoria");
    }

    if (dateEnd.isBefore(LocalDate.now())) {
      throw new BusinessRuleException("A data de termino nao pode estar no passado");
    }
  }
}
