package com.weunite.api.users.mapper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import com.weunite.api.users.domain.Athlete;
import com.weunite.api.users.domain.AthleteProfile;
import com.weunite.api.users.service.AthleteProfileService;
import java.time.LocalDate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import org.springframework.test.util.ReflectionTestUtils;

class UserMapperTest {

  private final UserMapper mapper = Mappers.getMapper(UserMapper.class);

  @BeforeEach
  void setUp() {
    ReflectionTestUtils.setField(
        mapper, "athleteProfileService", new AthleteProfileService(null, null));
  }

  @Test
  @DisplayName("Should prefer split athlete profile values when mapping user profile fields")
  void mapAthleteFieldsFromSplitProfile() {
    Athlete athlete = new Athlete();
    AthleteProfile profile = new AthleteProfile(athlete);
    profile.setHeight(1.91);
    profile.setWeight(86.4);
    profile.setFootDomain("LEFT");
    profile.setPosition("MIDFIELDER");
    profile.setBirthDate(LocalDate.of(1998, 5, 19));

    athlete.setProfile(profile);
    ReflectionTestUtils.setField(athlete, "height", 1.7);
    ReflectionTestUtils.setField(athlete, "weight", 70.0);
    ReflectionTestUtils.setField(athlete, "footDomain", "RIGHT");
    ReflectionTestUtils.setField(athlete, "position", "DEFENDER");
    ReflectionTestUtils.setField(athlete, "birthDate", LocalDate.of(2001, 1, 1));

    assertEquals(1.91, mapper.mapHeight(athlete));
    assertEquals(86.4, mapper.mapWeight(athlete));
    assertEquals("LEFT", mapper.mapFootDomain(athlete));
    assertEquals("MIDFIELDER", mapper.mapPosition(athlete));
    assertEquals(LocalDate.of(1998, 5, 19), mapper.mapBirthDate(athlete));
  }

  @Test
  @DisplayName(
      "Should fall back to legacy athlete subtype fields during profile split compatibility")
  void mapAthleteFieldsFromLegacySubtypeWhenSplitProfileIsMissing() {
    Athlete athlete = new Athlete();
    ReflectionTestUtils.setField(athlete, "height", 1.82);
    ReflectionTestUtils.setField(athlete, "weight", 78.2);
    ReflectionTestUtils.setField(athlete, "footDomain", "RIGHT");
    ReflectionTestUtils.setField(athlete, "position", "FORWARD");
    ReflectionTestUtils.setField(athlete, "birthDate", LocalDate.of(2000, 7, 10));

    assertNull(athlete.getProfile());
    assertEquals(1.82, mapper.mapHeight(athlete));
    assertEquals(78.2, mapper.mapWeight(athlete));
    assertEquals("RIGHT", mapper.mapFootDomain(athlete));
    assertEquals("FORWARD", mapper.mapPosition(athlete));
    assertEquals(LocalDate.of(2000, 7, 10), mapper.mapBirthDate(athlete));
  }
}
