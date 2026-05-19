package com.weunite.api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.weunite.api.opportunities.domain.Skill;
import com.weunite.api.opportunities.dto.SkillDTO;
import com.weunite.api.opportunities.repository.SkillRepository;
import com.weunite.api.users.domain.Athlete;
import com.weunite.api.users.domain.AthleteProfile;
import com.weunite.api.users.dto.UpdateUserRequestDTO;
import com.weunite.api.users.repository.AthleteProfileRepository;
import com.weunite.api.users.service.AthleteProfileService;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AthleteProfileServiceTest {

  @Mock private SkillRepository skillRepository;

  @Mock private AthleteProfileRepository athleteProfileRepository;

  @InjectMocks private AthleteProfileService athleteProfileService;

  @Test
  @DisplayName("Should update athlete profile values through split profile compatibility layer")
  void applyProfileUpdates() {
    Athlete athlete = new Athlete();
    UpdateUserRequestDTO requestDTO =
        new UpdateUserRequestDTO(
            null,
            null,
            null,
            null,
            1.88,
            83.5,
            " LEFT ",
            " FORWARD ",
            LocalDate.of(1999, 3, 12),
            null);

    athleteProfileService.applyProfileUpdates(athlete, requestDTO);

    assertEquals(1.88, athlete.getHeight());
    assertEquals(1.88, athlete.getProfile().getHeight());
    assertEquals(83.5, athlete.getWeight());
    assertEquals(83.5, athlete.getProfile().getWeight());
    assertEquals("LEFT", athlete.getFootDomain());
    assertEquals("LEFT", athlete.getProfile().getFootDomain());
    assertEquals("FORWARD", athlete.getPosition());
    assertEquals("FORWARD", athlete.getProfile().getPosition());
    assertEquals(LocalDate.of(1999, 3, 12), athlete.getBirthDate());
    assertEquals(LocalDate.of(1999, 3, 12), athlete.getProfile().getBirthDate());
    verify(athleteProfileRepository).save(athlete.getProfile());
  }

  @Test
  @DisplayName("Should resolve requested skills while ignoring blank skill names")
  void resolveRequestedSkills() {
    Athlete athlete = new Athlete();
    Skill existingSkill = new Skill("Speed");

    when(skillRepository.findByName("Speed")).thenReturn(existingSkill);
    when(skillRepository.findByName("Balance")).thenReturn(null);
    when(skillRepository.save(any(Skill.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    UpdateUserRequestDTO requestDTO =
        new UpdateUserRequestDTO(
            null,
            null,
            null,
            null,
            null,
            null,
            " ",
            null,
            null,
            List.of(
                new SkillDTO(null, "Speed"),
                new SkillDTO(null, " "),
                new SkillDTO(null, "Balance")));

    athleteProfileService.applyProfileUpdates(athlete, requestDTO);

    assertNull(athlete.getFootDomain());
    assertEquals(
        List.of("Speed", "Balance"), athlete.getSkills().stream().map(Skill::getName).toList());
    verify(skillRepository).findByName("Speed");
    verify(skillRepository).findByName("Balance");
    verify(skillRepository, never()).findByName(" ");
    verify(athleteProfileRepository).save(any(AthleteProfile.class));
  }
}
