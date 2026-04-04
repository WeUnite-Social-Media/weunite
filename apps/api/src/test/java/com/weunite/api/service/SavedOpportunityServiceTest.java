package com.weunite.api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.opportunities.domain.Opportunity;
import com.weunite.api.opportunities.domain.SavedOpportunity;
import com.weunite.api.opportunities.dto.OpportunityDTO;
import com.weunite.api.opportunities.dto.SavedOpportunityDTO;
import com.weunite.api.opportunities.mapper.SavedOpportunityMapper;
import com.weunite.api.opportunities.repository.OpportunityRepository;
import com.weunite.api.opportunities.repository.SavedOpportunityRepository;
import com.weunite.api.opportunities.service.SavedOpportunityService;
import com.weunite.api.users.domain.Athlete;
import com.weunite.api.users.repository.AthleteRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class SavedOpportunityServiceTest {

  @Mock private SavedOpportunityRepository savedOpportunityRepository;
  @Mock private OpportunityRepository opportunityRepository;
  @Mock private AthleteRepository athleteRepository;
  @Mock private SavedOpportunityMapper savedOpportunityMapper;

  @InjectMocks private SavedOpportunityService savedOpportunityService;

  @Test
  @DisplayName("Should save an active opportunity when it is not already saved")
  void toggleSavedOpportunitySaveSuccess() {
    Long athleteId = 1L;
    Long opportunityId = 2L;

    Athlete athlete = new Athlete();
    athlete.setId(athleteId);

    Opportunity opportunity = new Opportunity();
    opportunity.setId(opportunityId);

    SavedOpportunity savedOpportunity = new SavedOpportunity(athlete, opportunity);
    savedOpportunity.setId(3L);

    SavedOpportunityDTO savedOpportunityDTO =
        new SavedOpportunityDTO(
            3L,
            athleteId,
            new OpportunityDTO(
                opportunityId,
                "Opportunity",
                "Description",
                "Location",
                LocalDate.now().plusDays(10),
                Set.of(),
                Instant.now(),
                null,
                null),
            Instant.now());

    when(savedOpportunityRepository.findByAthleteIdAndOpportunityId(athleteId, opportunityId))
        .thenReturn(Optional.empty());
    when(athleteRepository.findById(athleteId)).thenReturn(Optional.of(athlete));
    when(opportunityRepository.findByIdAndDeletedFalse(opportunityId))
        .thenReturn(Optional.of(opportunity));
    when(savedOpportunityRepository.save(any(SavedOpportunity.class))).thenReturn(savedOpportunity);
    when(savedOpportunityMapper.toDTO(savedOpportunity)).thenReturn(savedOpportunityDTO);

    ResponseDTO<SavedOpportunityDTO> result =
        savedOpportunityService.toggleSavedOpportunity(athleteId, opportunityId);

    assertNotNull(result);
    assertEquals("Oportunidade salva com sucesso!", result.message());
    assertEquals(savedOpportunityDTO, result.data());
    verify(savedOpportunityRepository).save(any(SavedOpportunity.class));
  }

  @Test
  @DisplayName("Should remove an opportunity from saved list when it already exists")
  void toggleSavedOpportunityRemoveSuccess() {
    Long athleteId = 1L;
    Long opportunityId = 2L;

    Athlete athlete = new Athlete();
    athlete.setId(athleteId);

    Opportunity opportunity = new Opportunity();
    opportunity.setId(opportunityId);

    SavedOpportunity existingSavedOpportunity = new SavedOpportunity(athlete, opportunity);
    existingSavedOpportunity.setId(4L);

    when(savedOpportunityRepository.findByAthleteIdAndOpportunityId(athleteId, opportunityId))
        .thenReturn(Optional.of(existingSavedOpportunity));
    when(athleteRepository.findById(athleteId)).thenReturn(Optional.of(athlete));
    when(opportunityRepository.findByIdAndDeletedFalse(opportunityId))
        .thenReturn(Optional.of(opportunity));

    ResponseDTO<SavedOpportunityDTO> result =
        savedOpportunityService.toggleSavedOpportunity(athleteId, opportunityId);

    assertEquals("Oportunidade removida dos salvos com sucesso!", result.message());
    assertEquals(null, result.data());
    verify(savedOpportunityRepository).delete(existingSavedOpportunity);
  }

  @Test
  @DisplayName("Should list saved opportunities for an athlete")
  void getSavedOpportunitiesByAthleteSuccess() {
    Long athleteId = 1L;

    Athlete athlete = new Athlete();
    athlete.setId(athleteId);

    SavedOpportunity savedOpportunity = new SavedOpportunity();
    SavedOpportunityDTO savedOpportunityDTO =
        new SavedOpportunityDTO(1L, athleteId, null, Instant.now());

    when(athleteRepository.findById(athleteId)).thenReturn(Optional.of(athlete));
    when(savedOpportunityRepository.findByAthleteIdOrderBySavedAtDesc(athleteId))
        .thenReturn(List.of(savedOpportunity));
    when(savedOpportunityMapper.toDTO(savedOpportunity)).thenReturn(savedOpportunityDTO);

    List<SavedOpportunityDTO> result =
        savedOpportunityService.getSavedOpportunitiesByAthlete(athleteId);

    assertEquals(List.of(savedOpportunityDTO), result);
  }

  @Test
  @DisplayName("Should check whether an opportunity is saved")
  void isSavedSuccess() {
    Long athleteId = 1L;
    Long opportunityId = 2L;

    Athlete athlete = new Athlete();
    athlete.setId(athleteId);

    Opportunity opportunity = new Opportunity();
    opportunity.setId(opportunityId);

    when(athleteRepository.findById(athleteId)).thenReturn(Optional.of(athlete));
    when(opportunityRepository.findByIdAndDeletedFalse(opportunityId))
        .thenReturn(Optional.of(opportunity));
    when(savedOpportunityRepository.existsByAthleteIdAndOpportunityId(athleteId, opportunityId))
        .thenReturn(false);

    boolean result = savedOpportunityService.isSaved(athleteId, opportunityId);

    assertFalse(result);
    verify(savedOpportunityRepository).existsByAthleteIdAndOpportunityId(athleteId, opportunityId);
  }
}
