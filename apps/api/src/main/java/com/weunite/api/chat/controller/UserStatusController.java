package com.weunite.api.chat.controller;

import com.weunite.api.chat.dto.UserStatusDTO;
import com.weunite.api.chat.service.UserStatusService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequiredArgsConstructor
public class UserStatusController {

  private final SimpMessagingTemplate messagingTemplate;
  private final UserStatusService userStatusService;

  @MessageMapping("/user.status")
  public void updateUserStatus(
      @Payload UserStatusDTO statusUpdate, SimpMessageHeaderAccessor headerAccessor) {
    Long authenticatedUserId = userStatusService.requireAuthenticatedUserId(headerAccessor);
    UserStatusDTO normalizedStatus =
        userStatusService.updateUserStatus(authenticatedUserId, statusUpdate.getStatus());

    messagingTemplate.convertAndSend(
        "/topic/user/" + authenticatedUserId + "/status", normalizedStatus);
  }

  @GetMapping("/api/users/{userId}/status")
  @ResponseBody
  public ResponseEntity<UserStatusDTO> getUserStatus(@PathVariable Long userId) {
    UserStatusDTO status = userStatusService.getUserStatus(userId);
    return ResponseEntity.ok(status);
  }
}
