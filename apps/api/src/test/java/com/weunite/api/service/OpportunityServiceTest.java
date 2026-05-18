package com.weunite.api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

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
import com.weunite.api.opportunities.service.OpportunityService;
import com.weunite.api.users.domain.Company;
import com.weunite.api.users.exception.UserNotFoundException;
import com.weunite.api.users.repository.CompanyRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.util.HashSet;
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
class OpportunityServiceTest {

  @Mock private CompanyRepository companyRepository;
  @Mock private SkillRepository skillRepository;
  @Mock private OpportunityRepository opportunityRepository;
  @Mock private SavedOpportunityRepository savedOpportunityRepository;
  @Mock private OpportunityMapper opportunityMapper;

  @InjectMocks private OpportunityService opportunityService;

  @Test
  @DisplayName("Should create opportunity successfully when company exists")
  void createOpportunitySuccess() {
    Long companyId = 1L;
    Set<Skill> skills = Set.of(new Skill("Perna Esquerda"));

    OpportunityRequestDTO request =
        new OpportunityRequestDTO(
            "Lateral Esquerdo no Santos",
            "Lateral esquerdo senior",
            "Sao Paulo, SP",
            LocalDate.now().plusDays(30),
            skills);

    Company company = new Company();
    company.setId(companyId);

    ResponseDTO<OpportunityDTO> expectedResponse =
        new ResponseDTO<>(
            "Oportunidade criada com sucesso!",
            new OpportunityDTO(
                1L,
                request.title(),
                request.description(),
                request.location(),
                request.dateEnd(),
                skills,
                Instant.now(),
                null,
                null));

    when(companyRepository.findById(companyId)).thenReturn(Optional.of(company));
    when(skillRepository.findByName("Perna Esquerda")).thenReturn(new Skill("Perna Esquerda"));
    when(opportunityMapper.toResponseDTO(
            eq("Oportunidade criada com sucesso!"), any(Opportunity.class)))
        .thenReturn(expectedResponse);

    ResponseDTO<OpportunityDTO> result = opportunityService.createOpportunity(companyId, request);

    assertNotNull(result);
    assertEquals(expectedResponse, result);
    verify(opportunityRepository).save(any(Opportunity.class));
  }

  @Test
  @DisplayName("Should throw UserNotFoundException when company does not exist during creation")
  void createOpportunityWithNonExistentUser() {
    Long companyId = 999L;

    OpportunityRequestDTO request =
        new OpportunityRequestDTO(
            "Opportunity",
            "Descricao valida",
            "Sao Paulo, SP",
            LocalDate.now().plusDays(30),
            Set.of(new Skill("Java")));

    when(companyRepository.findById(companyId)).thenReturn(Optional.empty());

    assertThrows(
        UserNotFoundException.class,
        () -> opportunityService.createOpportunity(companyId, request));

    verify(companyRepository).findById(companyId);
    verifyNoInteractions(opportunityRepository, opportunityMapper);
  }

  @Test
  @DisplayName(
      "Should update opportunity successfully when user is owner and opportunity is active")
  void updateOpportunitySuccess() {
    Long userId = 1L;
    Long opportunityId = 1L;
    Set<Skill> updatedSkills = new HashSet<>();
    updatedSkills.add(new Skill("Python"));

    OpportunityRequestDTO request =
        new OpportunityRequestDTO(
            "Senior Lateral Esquerdo no Santos",
            "Desenvolvedor Python Senior",
            "Rio de Janeiro, RJ",
            LocalDate.now().plusDays(15),
            updatedSkills);

    Company company = new Company();
    company.setId(userId);

    Opportunity existingOpportunity = new Opportunity();
    existingOpportunity.setId(opportunityId);
    existingOpportunity.setCompany(company);
    existingOpportunity.setSkills(new HashSet<>());

    OpportunityDTO expectedDto =
        new OpportunityDTO(
            opportunityId,
            request.title(),
            request.description(),
            request.location(),
            request.dateEnd(),
            updatedSkills,
            null,
            Instant.now(),
            null);

    ResponseDTO<OpportunityDTO> expectedResponse =
        new ResponseDTO<>("Oportunidade atualizada com sucesso!", expectedDto);

    when(opportunityRepository.findByIdAndDeletedFalse(opportunityId))
        .thenReturn(Optional.of(existingOpportunity));
    when(opportunityMapper.toResponseDTO(
            eq("Oportunidade atualizada com sucesso!"), eq(existingOpportunity)))
        .thenReturn(expectedResponse);

    ResponseDTO<OpportunityDTO> result =
        opportunityService.updateOpportunity(userId, opportunityId, request);

    assertNotNull(result);
    assertEquals(expectedResponse, result);
    verify(opportunityRepository).save(existingOpportunity);
  }

  @Test
  @DisplayName(
      "Should throw OpportunityNotFoundException when active opportunity does not exist during update")
  void updateOpportunityWithNonExistentOpportunity() {
    Long userId = 1L;
    Long opportunityId = 999L;

    OpportunityRequestDTO request =
        new OpportunityRequestDTO(
            "Opportunity",
            "Descricao valida",
            "Rio de Janeiro, RJ",
            LocalDate.now().plusDays(10),
            Set.of(new Skill("Python")));

    when(opportunityRepository.findByIdAndDeletedFalse(opportunityId)).thenReturn(Optional.empty());

    assertThrows(
        OpportunityNotFoundException.class,
        () -> opportunityService.updateOpportunity(userId, opportunityId, request));

    verify(opportunityRepository).findByIdAndDeletedFalse(opportunityId);
    verifyNoInteractions(opportunityMapper);
  }

  @Test
  @DisplayName("Should throw UnauthorizedException when user is not the owner during update")
  void updateOpportunityWithUnauthorizedUser() {
    Long userId = 1L;
    Long ownerId = 2L;
    Long opportunityId = 1L;

    OpportunityRequestDTO request =
        new OpportunityRequestDTO(
            "Opportunity",
            "Descricao valida",
            "Rio de Janeiro, RJ",
            LocalDate.now().plusDays(10),
            Set.of(new Skill("Python")));

    Company owner = new Company();
    owner.setId(ownerId);

    Opportunity existingOpportunity = new Opportunity();
    existingOpportunity.setId(opportunityId);
    existingOpportunity.setCompany(owner);
    existingOpportunity.setSkills(new HashSet<>());

    when(opportunityRepository.findByIdAndDeletedFalse(opportunityId))
        .thenReturn(Optional.of(existingOpportunity));

    assertThrows(
        UnauthorizedException.class,
        () -> opportunityService.updateOpportunity(userId, opportunityId, request));

    verify(opportunityRepository).findByIdAndDeletedFalse(opportunityId);
    verifyNoInteractions(opportunityMapper);
  }

  @Test
  @DisplayName("Should delete opportunity successfully when user is owner")
  void deleteOpportunitySuccess() {
    Long userId = 1L;
    Long opportunityId = 1L;

    Company company = new Company();
    company.setId(userId);

    Opportunity existingOpportunity = new Opportunity();
    existingOpportunity.setId(opportunityId);
    existingOpportunity.setCompany(company);

    ResponseDTO<OpportunityDTO> expectedResponse =
        new ResponseDTO<>(
            "Oportunidade deletada com sucesso!",
            new OpportunityDTO(
                opportunityId,
                "Opportunity",
                "Descricao",
                "Sao Paulo, SP",
                LocalDate.now().plusDays(10),
                Set.of(),
                Instant.now(),
                null,
                null));

    when(opportunityRepository.findByIdAndDeletedFalse(opportunityId))
        .thenReturn(Optional.of(existingOpportunity));
    when(opportunityMapper.toResponseDTO(
            eq("Oportunidade deletada com sucesso!"), eq(existingOpportunity)))
        .thenReturn(expectedResponse);

    ResponseDTO<OpportunityDTO> result =
        opportunityService.deleteOpportunity(userId, opportunityId);

    assertEquals(expectedResponse, result);
    verify(savedOpportunityRepository).deleteByOpportunityId(opportunityId);
    verify(opportunityRepository).delete(existingOpportunity);
  }

  @Test
  @DisplayName(
      "Should throw OpportunityNotFoundException when opportunity does not exist during deletion")
  void deleteOpportunityWithNonExistentOpportunity() {
    Long userId = 1L;
    Long opportunityId = 999L;

    when(opportunityRepository.findByIdAndDeletedFalse(opportunityId)).thenReturn(Optional.empty());

    assertThrows(
        OpportunityNotFoundException.class,
        () -> opportunityService.deleteOpportunity(userId, opportunityId));

    verify(opportunityRepository).findByIdAndDeletedFalse(opportunityId);
    verify(opportunityRepository, never()).delete(any());
    verifyNoInteractions(opportunityMapper);
  }

  @Test
  @DisplayName("Should return active opportunities only")
  void getOpportunitiesSuccess() {
    Opportunity opportunity = new Opportunity();
    opportunity.setId(1L);

    OpportunityDTO dto =
        new OpportunityDTO(
            1L,
            "Opportunity",
            "Descricao",
            "Sao Paulo, SP",
            LocalDate.now().plusDays(10),
            Set.of(),
            Instant.now(),
            null,
            null);

    when(opportunityRepository.findAllActiveForReadModelOrderedByCreationDate())
        .thenReturn(List.of(opportunity));
    when(opportunityMapper.toOpportunityDTOList(List.of(opportunity))).thenReturn(List.of(dto));

    List<OpportunityDTO> result = opportunityService.getOpportunities();

    assertEquals(List.of(dto), result);
    verify(opportunityRepository).findAllActiveForReadModelOrderedByCreationDate();
  }
}
