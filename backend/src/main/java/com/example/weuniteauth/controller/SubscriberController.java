package com.example.weuniteauth.controller;

import com.example.weuniteauth.dto.Opportunity.SubscriberDTO;
import com.example.weuniteauth.dto.ResponseDTO;
import com.example.weuniteauth.service.SubscribersService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subscriber")
public class SubscriberController {

    private final SubscribersService subscribersService;

    public SubscriberController(SubscribersService subscribersService) {
        this.subscribersService = subscribersService;
    }

    @PostMapping("/toggleSubscriber/{athletId}/{opportunityId}")
    public ResponseEntity<ResponseDTO<SubscriberDTO>> toggleSubscriber(@PathVariable Long athletId, @PathVariable Long opportunityId) {
        ResponseDTO<SubscriberDTO> result = subscribersService.toggleSubscriber(athletId, opportunityId);
        return ResponseEntity.status(HttpStatus.OK).body(result);
    }

    @GetMapping("/subscribers/{opportunityId}")
    public ResponseEntity<List<SubscriberDTO>> getSubscribersByOpportunity(@PathVariable Long opportunityId) {
        List<SubscriberDTO> result = subscribersService.getSubscribersByOpportunity(opportunityId);
        return ResponseEntity.status(HttpStatus.OK).body(result);
    }
}
