package com.weunite.api.opportunities.mapper;

import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.opportunities.domain.Opportunity;
import com.weunite.api.opportunities.dto.OpportunityDTO;
import com.weunite.api.users.mapper.UserMapper;
import java.util.List;
import java.util.stream.Collectors;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(
    componentModel = "spring",
    uses = {SkillMapper.class, UserMapper.class})
public interface OpportunityMapper {

  @BeanMapping(ignoreByDefault = true)
  @Mapping(target = "title", source = "title")
  @Mapping(target = "description", source = "description")
  @Mapping(target = "location", source = "location")
  @Mapping(target = "dateEnd", source = "dateEnd")
  Opportunity toEntity(OpportunityDTO dto);

  @Mapping(target = "id", source = "opportunity.id", resultType = String.class)
  @Mapping(target = "title", source = "opportunity.title")
  @Mapping(target = "description", source = "opportunity.description")
  @Mapping(target = "location", source = "opportunity.location")
  @Mapping(target = "dateEnd", source = "opportunity.dateEnd")
  @Mapping(target = "createdAt", source = "opportunity.createdAt")
  @Mapping(target = "updatedAt", source = "opportunity.updatedAt")
  @Mapping(target = "skills", source = "opportunity.skills")
  @Mapping(target = "company", source = "opportunity.company")
  @Mapping(
      target = "subscribersCount",
      expression =
          "java(opportunity.getSubscribers() != null ? opportunity.getSubscribers().size() : 0)")
  OpportunityDTO toOpportunityDTO(Opportunity opportunity);

  default ResponseDTO<OpportunityDTO> toResponseDTO(String message, Opportunity opportunity) {
    OpportunityDTO opportunityDTO = toOpportunityDTO(opportunity);
    return new ResponseDTO<OpportunityDTO>(message, opportunityDTO);
  }

  default List<OpportunityDTO> toOpportunityDTOList(List<Opportunity> opportunities) {
    if (opportunities == null || opportunities.isEmpty()) {
      return List.of();
    }

    return opportunities.stream().map(this::toOpportunityDTO).collect(Collectors.toList());
  }
}
