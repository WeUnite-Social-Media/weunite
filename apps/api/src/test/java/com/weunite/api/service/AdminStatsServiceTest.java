package com.weunite.api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.weunite.api.admin.stats.dto.DashboardActivityDTO;
import com.weunite.api.admin.stats.dto.OpportunityByCategoryDTO;
import com.weunite.api.admin.stats.dto.OpportunityCategoryWithSkillsDTO;
import com.weunite.api.admin.stats.service.AdminStatsService;
import com.weunite.api.opportunities.domain.Opportunity;
import com.weunite.api.opportunities.domain.Skill;
import com.weunite.api.opportunities.repository.OpportunityRepository;
import com.weunite.api.posts.repository.PostRepository;
import com.weunite.api.users.repository.UserRepository;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AdminStatsServiceTest {

  @Mock private PostRepository postRepository;
  @Mock private OpportunityRepository opportunityRepository;
  @Mock private UserRepository userRepository;

  @InjectMocks private AdminStatsService adminStatsService;

  @Test
  @DisplayName("Should return dashboard activity with monthly post, opportunity and user counts")
  void getDashboardActivitySuccess() {
    when(postRepository.countPostsBetweenDates(any(Instant.class), any(Instant.class)))
        .thenReturn(10L, 20L, 30L);
    when(opportunityRepository.countOpportunitiesBetweenDates(
            any(Instant.class), any(Instant.class)))
        .thenReturn(2L, 4L, 6L);
    when(userRepository.countUsersCreatedBetweenDates(any(Instant.class), any(Instant.class)))
        .thenReturn(1L, 3L, 5L);

    List<DashboardActivityDTO> result = adminStatsService.getDashboardActivity(3);

    assertEquals(3, result.size());
    assertEquals(10L, result.get(0).posts());
    assertEquals(20L, result.get(1).posts());
    assertEquals(30L, result.get(2).posts());
    assertEquals(1L, result.get(0).users());
    assertEquals(3L, result.get(1).users());
    assertEquals(5L, result.get(2).users());
    assertNotNull(result.get(0).month());
    assertFalse(result.get(0).month().isBlank());
  }

  @Test
  @DisplayName(
      "Should aggregate top opportunity skills with related skills for legacy stats endpoint")
  void getOpportunitiesWithSkillsSuccess() {
    when(opportunityRepository.findAll())
        .thenReturn(
            List.of(
                opportunityWithSkills("Java", "Spring"),
                opportunityWithSkills("Java"),
                opportunityWithSkills("Java", "React")));

    List<OpportunityCategoryWithSkillsDTO> result = adminStatsService.getOpportunitiesWithSkills();

    assertEquals(3, result.size());
    assertEquals("Java", result.get(0).category());
    assertEquals(3L, result.get(0).count());
    assertEquals(List.of("React", "Spring"), result.get(0).topSkills());
  }

  @Test
  @DisplayName("Should return opportunity categories with percentage based on skill distribution")
  void getOpportunitiesByCategorySuccess() {
    when(opportunityRepository.findAll())
        .thenReturn(
            List.of(
                opportunityWithSkills("Java", "Spring"),
                opportunityWithSkills("Java"),
                opportunityWithSkills("Java", "React")));

    List<OpportunityByCategoryDTO> result = adminStatsService.getOpportunitiesByCategory();

    assertEquals(3, result.size());
    assertEquals("Java", result.get(0).category());
    assertEquals(3L, result.get(0).count());
    assertEquals(60.0, result.get(0).percentage());
    assertEquals("React", result.get(1).category());
    assertEquals(20.0, result.get(1).percentage());
    assertEquals("Spring", result.get(2).category());
    assertEquals(20.0, result.get(2).percentage());
  }

  private Opportunity opportunityWithSkills(String... skillNames) {
    Opportunity opportunity = new Opportunity();
    opportunity.setSkills(Arrays.stream(skillNames).map(Skill::new).collect(Collectors.toSet()));
    return opportunity;
  }
}
