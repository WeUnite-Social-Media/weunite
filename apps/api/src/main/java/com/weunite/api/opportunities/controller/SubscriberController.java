package com.weunite.api.opportunities.controller;

import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.common.security.service.AuthenticatedUserService;
import com.weunite.api.opportunities.dto.SubscriberDTO;
import com.weunite.api.opportunities.service.SubscribersService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/subscriber")
public class SubscriberController {

  private final SubscribersService subscribersService;
  private final AuthenticatedUserService authenticatedUserService;

  public SubscriberController(
      SubscribersService subscribersService, AuthenticatedUserService authenticatedUserService) {
    this.subscribersService = subscribersService;
    this.authenticatedUserService = authenticatedUserService;
  }

  @PostMapping("/toggleSubscriber/{athleteId}/{opportunityId}")
  public ResponseEntity<ResponseDTO<SubscriberDTO>> toggleSubscriber(
      @AuthenticationPrincipal Jwt jwt,
      @PathVariable Long athleteId,
      @PathVariable Long opportunityId) {
    Long authenticatedUserId = authenticatedUserService.requireMatchingUserId(jwt, athleteId);
    ResponseDTO<SubscriberDTO> result =
        subscribersService.toggleSubscriber(authenticatedUserId, opportunityId);
    return ResponseEntity.status(HttpStatus.OK).body(result);
  }

  @GetMapping("/subscribers/{opportunityId}")
  public ResponseEntity<List<SubscriberDTO>> getSubscribersByOpportunity(
      @AuthenticationPrincipal Jwt jwt,
      @PathVariable Long opportunityId,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size) {
    Long authenticatedUserId = authenticatedUserService.requireUserId(jwt);
    List<SubscriberDTO> result =
        subscribersService.getSubscribersByOpportunity(
            authenticatedUserId, opportunityId, page, size);
    return ResponseEntity.status(HttpStatus.OK).body(result);
  }

  @GetMapping("/isSubscribed/{athleteId}/{opportunityId}")
  public ResponseEntity<Boolean> isSubscribed(
      @AuthenticationPrincipal Jwt jwt,
      @PathVariable Long athleteId,
      @PathVariable Long opportunityId) {
    Long authenticatedUserId = authenticatedUserService.requireMatchingUserId(jwt, athleteId);
    Boolean result = subscribersService.isSubscribed(authenticatedUserId, opportunityId);
    return ResponseEntity.status(HttpStatus.OK).body(result);
  }

  @GetMapping("/athlete/{athleteId}")
  public ResponseEntity<List<SubscriberDTO>> getSubscribersByAthlete(
      @AuthenticationPrincipal Jwt jwt,
      @PathVariable Long athleteId,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size) {
    Long authenticatedUserId = authenticatedUserService.requireMatchingUserId(jwt, athleteId);
    List<SubscriberDTO> result =
        subscribersService.getSubscribersByAthlete(authenticatedUserId, page, size);
    return ResponseEntity.status(HttpStatus.OK).body(result);
  }
}
