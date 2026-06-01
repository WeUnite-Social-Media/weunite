package com.weunite.api.opportunities.controller;

import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.common.security.service.AuthenticatedUserService;
import com.weunite.api.opportunities.dto.OpportunityDTO;
import com.weunite.api.opportunities.dto.OpportunityRequestDTO;
import com.weunite.api.opportunities.service.OpportunityService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/opportunities")
@Validated
public class OpportunityController {

  private final OpportunityService opportunityService;
  private final AuthenticatedUserService authenticatedUserService;

  public OpportunityController(
      OpportunityService opportunityService, AuthenticatedUserService authenticatedUserService) {
    this.opportunityService = opportunityService;
    this.authenticatedUserService = authenticatedUserService;
  }

  @PostMapping(value = "/create/{companyId}")
  public ResponseEntity<ResponseDTO<OpportunityDTO>> createOpportunity(
      @AuthenticationPrincipal Jwt jwt,
      @PathVariable Long companyId,
      @RequestPart("opportunity") @Valid OpportunityRequestDTO opportunity) {
    Long authenticatedUserId = authenticatedUserService.requireMatchingUserId(jwt, companyId);
    ResponseDTO<OpportunityDTO> createdOpportunity =
        opportunityService.createOpportunity(authenticatedUserId, opportunity);
    return ResponseEntity.status(HttpStatus.OK).body(createdOpportunity);
  }

  @PutMapping("/update/{companyId}/{opportunityId}")
  public ResponseEntity<ResponseDTO<OpportunityDTO>> updateOpportunity(
      @AuthenticationPrincipal Jwt jwt,
      @PathVariable Long companyId,
      @PathVariable Long opportunityId,
      @RequestBody @Valid OpportunityRequestDTO opportunity) {
    Long authenticatedUserId = authenticatedUserService.requireMatchingUserId(jwt, companyId);
    ResponseDTO<OpportunityDTO> updatedOpportunity =
        opportunityService.updateOpportunity(authenticatedUserId, opportunityId, opportunity);
    return ResponseEntity.status(HttpStatus.OK).body(updatedOpportunity);
  }

  @GetMapping("/get/{opportunityId}")
  public ResponseEntity<ResponseDTO<OpportunityDTO>> getOpportunity(
      @PathVariable Long opportunityId) {
    ResponseDTO<OpportunityDTO> opportunity = opportunityService.getOpportunity(opportunityId);
    return ResponseEntity.status(HttpStatus.OK).body(opportunity);
  }

  @GetMapping("/get")
  public ResponseEntity<List<OpportunityDTO>> getOpportunities(
      @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
    List<OpportunityDTO> opportunities = opportunityService.getOpportunities(page, size);
    return ResponseEntity.status(HttpStatus.OK).body(opportunities);
  }

  @GetMapping("/get/company/{companyId}")
  public ResponseEntity<List<OpportunityDTO>> getOpportunitiesByCompanyId(
      @PathVariable Long companyId,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size) {
    List<OpportunityDTO> opportunities =
        opportunityService.getOpportunitiesByCompanyId(companyId, page, size);
    return ResponseEntity.status(HttpStatus.OK).body(opportunities);
  }

  @DeleteMapping("/delete/{companyId}/{opportunityId}")
  public ResponseEntity<ResponseDTO<OpportunityDTO>> deleteOpportunity(
      @AuthenticationPrincipal Jwt jwt,
      @PathVariable Long companyId,
      @PathVariable Long opportunityId) {
    Long authenticatedUserId = authenticatedUserService.requireMatchingUserId(jwt, companyId);
    ResponseDTO<OpportunityDTO> opportunity =
        opportunityService.deleteOpportunity(authenticatedUserId, opportunityId);
    return ResponseEntity.status(HttpStatus.OK).body(opportunity);
  }
}
