package com.weunite.api.opportunities.controller;

import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.opportunities.dto.SavedOpportunityDTO;
import com.weunite.api.opportunities.service.SavedOpportunityService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/saved-opportunities")
public class SavedOpportunityController {

  private final SavedOpportunityService savedOpportunityService;

  public SavedOpportunityController(SavedOpportunityService savedOpportunityService) {
    this.savedOpportunityService = savedOpportunityService;
  }

  @PostMapping("/toggle/{athleteId}/{opportunityId}")
  public ResponseEntity<ResponseDTO<SavedOpportunityDTO>> toggleSavedOpportunity(
      @PathVariable Long athleteId, @PathVariable Long opportunityId) {
    ResponseDTO<SavedOpportunityDTO> result =
        savedOpportunityService.toggleSavedOpportunity(athleteId, opportunityId);
    return ResponseEntity.status(HttpStatus.OK).body(result);
  }

  @GetMapping("/athlete/{athleteId}")
  public ResponseEntity<List<SavedOpportunityDTO>> getSavedOpportunities(
      @PathVariable Long athleteId) {
    List<SavedOpportunityDTO> result =
        savedOpportunityService.getSavedOpportunitiesByAthlete(athleteId);
    return ResponseEntity.status(HttpStatus.OK).body(result);
  }

  @GetMapping("/isSaved/{athleteId}/{opportunityId}")
  public ResponseEntity<Boolean> isSaved(
      @PathVariable Long athleteId, @PathVariable Long opportunityId) {
    Boolean result = savedOpportunityService.isSaved(athleteId, opportunityId);
    return ResponseEntity.status(HttpStatus.OK).body(result);
  }
}
