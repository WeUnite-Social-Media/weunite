package com.weunite.api.opportunities.mapper;

import com.weunite.api.opportunities.domain.SavedOpportunity;
import com.weunite.api.opportunities.dto.SavedOpportunityDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(
    componentModel = "spring",
    uses = {OpportunityMapper.class})
public interface SavedOpportunityMapper {

  @Mapping(target = "athleteId", source = "athlete.id")
  @Mapping(target = "opportunity", source = "opportunity")
  SavedOpportunityDTO toDTO(SavedOpportunity savedOpportunity);
}
