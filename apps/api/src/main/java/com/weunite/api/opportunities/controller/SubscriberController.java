package com.weunite.api.opportunities.controller;

import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.opportunities.dto.SubscriberDTO;
import com.weunite.api.opportunities.service.SubscribersService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/subscriber")
public class SubscriberController {

  private final SubscribersService subscribersService;

  public SubscriberController(SubscribersService subscribersService) {
    this.subscribersService = subscribersService;
  }

  @PostMapping("/toggleSubscriber/{athletId}/{opportunityId}")
  public ResponseEntity<ResponseDTO<SubscriberDTO>> toggleSubscriber(
      @PathVariable Long athletId, @PathVariable Long opportunityId) {
    ResponseDTO<SubscriberDTO> result =
        subscribersService.toggleSubscriber(athletId, opportunityId);
    return ResponseEntity.status(HttpStatus.OK).body(result);
  }

  @GetMapping("/subscribers/{opportunityId}")
  public ResponseEntity<List<SubscriberDTO>> getSubscribersByOpportunity(
      @PathVariable Long opportunityId) {
    List<SubscriberDTO> result = subscribersService.getSubscribersByOpportunity(opportunityId);
    return ResponseEntity.status(HttpStatus.OK).body(result);
  }
}
