package com.weunite.api.opportunities.service;

import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.opportunities.domain.Opportunity;
import com.weunite.api.opportunities.domain.SavedOpportunity;
import com.weunite.api.opportunities.dto.SavedOpportunityDTO;
import com.weunite.api.opportunities.exception.OpportunityNotFoundException;
import com.weunite.api.opportunities.mapper.SavedOpportunityMapper;
import com.weunite.api.opportunities.repository.OpportunityRepository;
import com.weunite.api.opportunities.repository.SavedOpportunityRepository;
import com.weunite.api.users.domain.Athlete;
import com.weunite.api.users.exception.UserNotFoundException;
import com.weunite.api.users.repository.AthleteRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SavedOpportunityService {

  private final SavedOpportunityRepository savedOpportunityRepository;
  private final OpportunityRepository opportunityRepository;
  private final AthleteRepository athleteRepository;
  private final SavedOpportunityMapper savedOpportunityMapper;

  public SavedOpportunityService(
      SavedOpportunityRepository savedOpportunityRepository,
      OpportunityRepository opportunityRepository,
      AthleteRepository athleteRepository,
      SavedOpportunityMapper savedOpportunityMapper) {
    this.savedOpportunityRepository = savedOpportunityRepository;
    this.opportunityRepository = opportunityRepository;
    this.athleteRepository = athleteRepository;
    this.savedOpportunityMapper = savedOpportunityMapper;
  }

  @Transactional
  public ResponseDTO<SavedOpportunityDTO> toggleSavedOpportunity(
      Long athleteId, Long opportunityId) {
    Athlete athlete = athleteRepository.findById(athleteId).orElseThrow(UserNotFoundException::new);
    Opportunity opportunity = getActiveOpportunity(opportunityId);

    return savedOpportunityRepository
        .findByAthleteIdAndOpportunityId(athleteId, opportunityId)
        .map(
            existing -> {
              savedOpportunityRepository.delete(existing);
              return new ResponseDTO<SavedOpportunityDTO>(
                  "Oportunidade removida dos salvos com sucesso!", null);
            })
        .orElseGet(() -> createSavedOpportunity(athlete, opportunity));
  }

  @Transactional(readOnly = true)
  public List<SavedOpportunityDTO> getSavedOpportunitiesByAthlete(Long athleteId) {
    athleteRepository.findById(athleteId).orElseThrow(UserNotFoundException::new);

    return savedOpportunityRepository.findByAthleteIdOrderBySavedAtDesc(athleteId).stream()
        .map(savedOpportunityMapper::toDTO)
        .toList();
  }

  @Transactional(readOnly = true)
  public boolean isSaved(Long athleteId, Long opportunityId) {
    athleteRepository.findById(athleteId).orElseThrow(UserNotFoundException::new);
    getActiveOpportunity(opportunityId);
    return savedOpportunityRepository.existsByAthleteIdAndOpportunityId(athleteId, opportunityId);
  }

  private ResponseDTO<SavedOpportunityDTO> createSavedOpportunity(
      Athlete athlete, Opportunity opportunity) {
    SavedOpportunity savedOpportunity = new SavedOpportunity(athlete, opportunity);
    SavedOpportunity saved = savedOpportunityRepository.save(savedOpportunity);

    return new ResponseDTO<>(
        "Oportunidade salva com sucesso!", savedOpportunityMapper.toDTO(saved));
  }

  private Opportunity getActiveOpportunity(Long opportunityId) {
    return opportunityRepository
        .findByIdAndDeletedFalse(opportunityId)
        .orElseThrow(OpportunityNotFoundException::new);
  }
}
