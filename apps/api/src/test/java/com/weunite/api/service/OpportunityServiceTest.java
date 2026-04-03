package com.weunite.api.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

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
import com.weunite.api.users.repository.UserRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
public class OpportunityServiceTest {

  @Mock private UserRepository userRepository;

  @Mock private CompanyRepository companyRepository;

  @Mock private SkillRepository skillRepository;

  @Mock private OpportunityRepository opportunityRepository;

  @Mock private SavedOpportunityRepository savedOpportunityRepository;

  @Mock private OpportunityMapper opportunityMapper;

  @InjectMocks private OpportunityService opportunityService;

  // CREATE OPPORTUNITY TESTS

  @Test
  @DisplayName("Should create opportunity successfully when user exists and data is valid")
  void createOpportunitySuccess() {
    Long companyId = 1L;
    Set<Skill> skills = new HashSet<>();
    skills.add(new Skill("Perna Esquerda"));

    OpportunityRequestDTO opportunityDTO =
        new OpportunityRequestDTO(
            "Lateral Esquerdo no Santos",
            "Latreal esquerdo Sênior",
            "São Paulo, SP",
            LocalDate.of(2025, 12, 31),
            skills);

    Company mockCompany = new Company();
    mockCompany.setId(companyId);
    mockCompany.setName("Test Company");
    mockCompany.setUsername("testuser");
    mockCompany.setEmail("test@example.com");
    mockCompany.setPassword("testpassword");
    mockCompany.setCNPJ("12345678000199");

    Opportunity createdOpportunity =
        new Opportunity(
            mockCompany,
            opportunityDTO.title(),
            opportunityDTO.description(),
            opportunityDTO.location(),
            opportunityDTO.dateEnd(),
            opportunityDTO.skills());
    createdOpportunity.setId(1L);
    createdOpportunity.setCreatedAt(Instant.now());

    ResponseDTO<OpportunityDTO> expectedResponse =
        new ResponseDTO<>(
            "Oportunidade criada com sucesso!",
            new OpportunityDTO(
                1L,
                "Lateral Esquerdo no Santos",
                "Lateral esquerdo no Santos",
                "São Paulo, SP",
                LocalDate.of(2025, 12, 31),
                skills,
                Instant.now(),
                null,
                null));

    when(companyRepository.findById(companyId)).thenReturn(Optional.of(mockCompany));
    when(skillRepository.findByName("Perna Esquerda")).thenReturn(new Skill("Perna Esquerda"));
    when(opportunityRepository.save(any(Opportunity.class))).thenReturn(createdOpportunity);
    when(opportunityMapper.toResponseDTO(
            eq("Oportunidade criada com sucesso!"), any(Opportunity.class)))
        .thenReturn(expectedResponse);

    ResponseDTO<OpportunityDTO> result =
        opportunityService.createOpportunity(companyId, opportunityDTO);

    assertNotNull(result);
    assertEquals("Oportunidade criada com sucesso!", result.message());
    assertNotNull(result.data());
    assertEquals("Lateral Esquerdo no Santos", result.data().title());
    assertEquals("Lateral esquerdo no Santos", result.data().description());

    verify(companyRepository).findById(companyId);
    verify(opportunityRepository).save(any(Opportunity.class));
    verify(opportunityMapper)
        .toResponseDTO(eq("Oportunidade criada com sucesso!"), any(Opportunity.class));
  }

  @Test
  @DisplayName("Should throw UserNotFoundException when user does not exist during creation")
  void createOpportunityWithNonExistentUser() {
    Long userId = 999L;
    Set<Skill> skills = new HashSet<>();
    skills.add(new Skill("Java"));

    OpportunityRequestDTO opportunityDTO =
        new OpportunityRequestDTO(
            "Lateral Esquerdo no Santos",
            "Latreal esquerdo Sênior",
            "São Paulo, SP",
            LocalDate.of(2025, 12, 31),
            skills);

    when(companyRepository.findById(userId)).thenReturn(Optional.empty());

    UserNotFoundException exception =
        assertThrows(
            UserNotFoundException.class,
            () -> opportunityService.createOpportunity(userId, opportunityDTO));

    assertNotNull(exception);
    verify(companyRepository).findById(userId);
    verifyNoInteractions(opportunityRepository, opportunityMapper);
  }

  // UPDATE OPPORTUNITY TESTS

  @Test
  @DisplayName("Should update opportunity successfully when user is owner and data is valid")
  void updateOpportunitySuccess() {
    Long userId = 1L;
    Long opportunityId = 1L;
    Set<Skill> updatedSkills = new HashSet<>();
    updatedSkills.add(new Skill("Python"));

    OpportunityDTO updatedOpportunityDTO =
        new OpportunityDTO(
            opportunityId,
            "Senior Lateral Esquerdo no Santos",
            "Desenvolvedor Python Sênior",
            "Rio de Janeiro, RJ",
            LocalDate.of(2025, 11, 30),
            updatedSkills,
            null,
            null,
            null);

    Company mockCompany = new Company();
    mockCompany.setId(userId);
    mockCompany.setUsername("testuser");

    Opportunity existingOpportunity = new Opportunity();
    existingOpportunity.setId(opportunityId);
    existingOpportunity.setCompany(mockCompany);
    existingOpportunity.setTitle("Lateral Esquerdo no Santos");

    Opportunity updatedOpportunity = new Opportunity();
    updatedOpportunity.setId(opportunityId);
    updatedOpportunity.setTitle("Senior Lateral Esquerdo no Santos");
    updatedOpportunity.setUpdatedAt(Instant.now());

    ResponseDTO<OpportunityDTO> expectedResponse =
        new ResponseDTO<>("Oportunidade atualizada com sucesso!", updatedOpportunityDTO);

    when(opportunityRepository.findById(opportunityId))
        .thenReturn(Optional.of(existingOpportunity));
    when(opportunityRepository.save(any(Opportunity.class))).thenReturn(updatedOpportunity);
    when(opportunityMapper.toResponseDTO(
            eq("Oportunidade atualizada com sucesso!"), any(Opportunity.class)))
        .thenReturn(expectedResponse);

    ResponseDTO<OpportunityDTO> result =
        opportunityService.updateOpportunity(userId, opportunityId, updatedOpportunityDTO);

    assertNotNull(result);
    assertEquals("Oportunidade atualizada com sucesso!", result.message());
    assertNotNull(result.data());

    verify(opportunityRepository).findById(opportunityId);
    verify(opportunityRepository).save(any(Opportunity.class));
    verify(opportunityMapper)
        .toResponseDTO(eq("Oportunidade atualizada com sucesso!"), any(Opportunity.class));
  }

  @Test
  @DisplayName(
      "Should throw OpportunityNotFoundException when opportunity does not exist during update")
  void updateOpportunityWithNonExistentOpportunity() {
    Long userId = 1L;
    Long opportunityId = 999L;
    OpportunityDTO updatedOpportunityDTO =
        new OpportunityDTO(
            opportunityId,
            "Senior Lateral Esquerdo no Santos",
            "Desenvolvedor Python Sênior",
            "Rio de Janeiro, RJ",
            LocalDate.of(2025, 11, 30),
            new HashSet<>(),
            null,
            null,
            null);

    when(opportunityRepository.findById(opportunityId)).thenReturn(Optional.empty());

    OpportunityNotFoundException exception =
        assertThrows(
            OpportunityNotFoundException.class,
            () ->
                opportunityService.updateOpportunity(userId, opportunityId, updatedOpportunityDTO));

    assertNotNull(exception);
    verify(opportunityRepository).findById(opportunityId);
    verifyNoInteractions(opportunityMapper);
  }

  @Test
  @DisplayName("Should throw UnauthorizedException when user is not the owner during update")
  void updateOpportunityWithUnauthorizedUser() {
    Long userId = 1L;
    Long ownerId = 2L;
    Long opportunityId = 1L;

    OpportunityDTO updatedOpportunityDTO =
        new OpportunityDTO(
            opportunityId,
            "Senior Lateral Esquerdo no Santos",
            "Desenvolvedor Python Sênior",
            "Rio de Janeiro, RJ",
            LocalDate.of(2025, 11, 30),
            new HashSet<>(),
            null,
            null,
            null);

    Company opportunityOwner = new Company();
    opportunityOwner.setId(ownerId);
    opportunityOwner.setUsername("owner");

    Opportunity existingOpportunity = new Opportunity();
    existingOpportunity.setId(opportunityId);
    existingOpportunity.setCompany(opportunityOwner);

    when(opportunityRepository.findById(opportunityId))
        .thenReturn(Optional.of(existingOpportunity));

    UnauthorizedException exception =
        assertThrows(
            UnauthorizedException.class,
            () ->
                opportunityService.updateOpportunity(userId, opportunityId, updatedOpportunityDTO));

    assertEquals(
        "Você não possui autorização para atualizar esta oportunidade.", exception.getMessage());
    verify(opportunityRepository).findById(opportunityId);
    verifyNoInteractions(opportunityMapper);
  }

  // DELETE OPPORTUNITY TESTS

  @Test
  @DisplayName("Should delete opportunity successfully when user is owner")
  void deleteOpportunitySuccess() {
    Long userId = 1L;
    Long opportunityId = 1L;

    Company mockCompany = new Company();
    mockCompany.setId(userId);
    mockCompany.setUsername("testuser");

    Opportunity existingOpportunity = new Opportunity();
    existingOpportunity.setId(opportunityId);
    existingOpportunity.setCompany(mockCompany);
    existingOpportunity.setTitle("Lateral Esquerdo no Santos");

    ResponseDTO<OpportunityDTO> expectedResponse =
        new ResponseDTO<>(
            "Oportunidade deletada com sucesso!",
            new OpportunityDTO(
                opportunityId,
                "Lateral Esquerdo no Santos",
                "Lateral esquerdo",
                "São Paulo, SP",
                LocalDate.of(2025, 12, 31),
                new HashSet<>(),
                Instant.now(),
                null,
                null));

    when(opportunityRepository.findById(opportunityId))
        .thenReturn(Optional.of(existingOpportunity));
    when(opportunityMapper.toResponseDTO(
            eq("Oportunidade deletada com sucesso!"), eq(existingOpportunity)))
        .thenReturn(expectedResponse);

    ResponseDTO<OpportunityDTO> result =
        opportunityService.deleteOpportunity(userId, opportunityId);

    assertNotNull(result);
    assertEquals("Oportunidade deletada com sucesso!", result.message());
    assertNotNull(result.data());

    verify(opportunityRepository).findById(opportunityId);
    verify(savedOpportunityRepository).deleteByOpportunityId(opportunityId);
    verify(opportunityRepository).delete(existingOpportunity);
    verify(opportunityMapper)
        .toResponseDTO(eq("Oportunidade deletada com sucesso!"), eq(existingOpportunity));
  }

  @Test
  @DisplayName(
      "Should throw OpportunityNotFoundException when opportunity does not exist during deletion")
  void deleteOpportunityWithNonExistentOpportunity() {
    Long userId = 1L;
    Long opportunityId = 999L;

    when(opportunityRepository.findById(opportunityId)).thenReturn(Optional.empty());

    OpportunityNotFoundException exception =
        assertThrows(
            OpportunityNotFoundException.class,
            () -> opportunityService.deleteOpportunity(userId, opportunityId));

    assertNotNull(exception);
    verify(opportunityRepository).findById(opportunityId);
    verify(opportunityRepository, never()).delete(any());
    verifyNoInteractions(opportunityMapper);
  }

  @Test
  @DisplayName("Should throw UnauthorizedException when user is not the owner during deletion")
  void deleteOpportunityWithUnauthorizedUser() {
    Long userId = 1L;
    Long ownerId = 2L;
    Long opportunityId = 1L;

    Company opportunityOwner = new Company();
    opportunityOwner.setId(ownerId);
    opportunityOwner.setUsername("owner");

    Opportunity existingOpportunity = new Opportunity();
    existingOpportunity.setId(opportunityId);
    existingOpportunity.setCompany(opportunityOwner);

    when(opportunityRepository.findById(opportunityId))
        .thenReturn(Optional.of(existingOpportunity));

    UnauthorizedException exception =
        assertThrows(
            UnauthorizedException.class,
            () -> opportunityService.deleteOpportunity(userId, opportunityId));

    assertEquals(
        "Você não possui autorização para deletar esta oportunidade.", exception.getMessage());
    verify(opportunityRepository).findById(opportunityId);
    verify(opportunityRepository, never()).delete(any());
    verifyNoInteractions(opportunityMapper);
  }
}
