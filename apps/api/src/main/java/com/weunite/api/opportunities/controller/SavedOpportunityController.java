package com.weunite.api.opportunities.controller;

import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.common.security.service.AuthenticatedUserService;
import com.weunite.api.opportunities.dto.SavedOpportunityDTO;
import com.weunite.api.opportunities.service.SavedOpportunityService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/saved-opportunities")
public class SavedOpportunityController {

  private final SavedOpportunityService savedOpportunityService;
  private final AuthenticatedUserService authenticatedUserService;

  public SavedOpportunityController(
      SavedOpportunityService savedOpportunityService,
      AuthenticatedUserService authenticatedUserService) {
    this.savedOpportunityService = savedOpportunityService;
    this.authenticatedUserService = authenticatedUserService;
  }

  @PostMapping("/toggle/{athleteId}/{opportunityId}")
  public ResponseEntity<ResponseDTO<SavedOpportunityDTO>> toggleSavedOpportunity(
      @AuthenticationPrincipal Jwt jwt,
      @PathVariable Long athleteId,
      @PathVariable Long opportunityId) {
    Long authenticatedUserId = authenticatedUserService.requireMatchingUserId(jwt, athleteId);
    ResponseDTO<SavedOpportunityDTO> result =
        savedOpportunityService.toggleSavedOpportunity(authenticatedUserId, opportunityId);
    return ResponseEntity.status(HttpStatus.OK).body(result);
  }

  @GetMapping("/athlete/{athleteId}")
  public ResponseEntity<List<SavedOpportunityDTO>> getSavedOpportunities(
      @AuthenticationPrincipal Jwt jwt, @PathVariable Long athleteId) {
    Long authenticatedUserId = authenticatedUserService.requireMatchingUserId(jwt, athleteId);
    List<SavedOpportunityDTO> result =
        savedOpportunityService.getSavedOpportunitiesByAthlete(authenticatedUserId);
    return ResponseEntity.status(HttpStatus.OK).body(result);
  }

  @GetMapping("/isSaved/{athleteId}/{opportunityId}")
  public ResponseEntity<Boolean> isSaved(
      @AuthenticationPrincipal Jwt jwt,
      @PathVariable Long athleteId,
      @PathVariable Long opportunityId) {
    Long authenticatedUserId = authenticatedUserService.requireMatchingUserId(jwt, athleteId);
    Boolean result = savedOpportunityService.isSaved(authenticatedUserId, opportunityId);
    return ResponseEntity.status(HttpStatus.OK).body(result);
  }
}
