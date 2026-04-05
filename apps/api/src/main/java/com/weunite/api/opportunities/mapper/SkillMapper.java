package com.weunite.api.opportunities.mapper;

import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.opportunities.domain.Skill;
import com.weunite.api.opportunities.dto.SkillDTO;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SkillMapper {

  @Mapping(target = "id", source = "skill.id", resultType = String.class)
  @Mapping(target = "name", source = "skill.name", resultType = String.class)
  SkillDTO toSkillDTO(Skill skill);

  default ResponseDTO<SkillDTO> toResponseDTO(String message, Skill skill) {
    SkillDTO skillDTO = toSkillDTO(skill);
    return new ResponseDTO<>(message, skillDTO);
  }

  default List<SkillDTO> toSkillDTOList(List<Skill> skills) {
    if (skills == null || skills.isEmpty()) {
      return List.of();
    }

    return skills.stream().map(this::toSkillDTO).collect(Collectors.toList());
  }

  default List<SkillDTO> toSkillDTOList(Set<Skill> skills) {
    if (skills == null || skills.isEmpty()) {
      return List.of();
    }

    return skills.stream().map(this::toSkillDTO).collect(Collectors.toList());
  }
}
