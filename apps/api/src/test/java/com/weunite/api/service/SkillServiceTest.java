package com.weunite.api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.weunite.api.opportunities.domain.Skill;
import com.weunite.api.opportunities.dto.SkillDTO;
import com.weunite.api.opportunities.mapper.SkillMapper;
import com.weunite.api.opportunities.repository.SkillRepository;
import com.weunite.api.opportunities.service.SkillService;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;

@ExtendWith(MockitoExtension.class)
class SkillServiceTest {

  @Mock private SkillRepository skillRepository;
  @Mock private SkillMapper skillMapper;

  @InjectMocks private SkillService skillService;

  @Test
  @DisplayName("Should return all skills ordered for selector integration")
  void getAllSkillsReturnsMappedList() {
    List<Skill> skills = List.of(new Skill("Finalizacao"), new Skill("Velocidade"));
    List<SkillDTO> mappedSkills =
        List.of(new SkillDTO(1L, "Finalizacao"), new SkillDTO(2L, "Velocidade"));

    when(skillRepository.findAll(any(Sort.class))).thenReturn(skills);
    when(skillMapper.toSkillDTOList(skills)).thenReturn(mappedSkills);

    List<SkillDTO> result = skillService.getAllSkills();

    assertNotNull(result);
    assertEquals(2, result.size());
    assertEquals("Finalizacao", result.get(0).name());
    verify(skillRepository).findAll(Sort.by(Sort.Direction.ASC, "name"));
    verify(skillMapper).toSkillDTOList(skills);
  }
}
