package com.example.weuniteauth.controller;

import com.example.weuniteauth.dto.chat.UserStatusDTO;
import com.example.weuniteauth.service.UserStatusService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;

import java.time.LocalDateTime;

@Controller
@RequiredArgsConstructor
public class UserStatusController {

    private final SimpMessagingTemplate messagingTemplate;
    private final UserStatusService userStatusService;

    @MessageMapping("/user.status")
    public void updateUserStatus(@Payload UserStatusDTO statusUpdate) {
        statusUpdate.setTimestamp(LocalDateTime.now());
        userStatusService.updateUserStatus(statusUpdate);

        messagingTemplate.convertAndSend(
                "/topic/user/" + statusUpdate.getUserId() + "/status",
                statusUpdate
        );
    }

    @GetMapping("/api/users/{userId}/status")
    @ResponseBody
    public ResponseEntity<UserStatusDTO> getUserStatus(@PathVariable Long userId) {
        UserStatusDTO status = userStatusService.getUserStatus(userId);
        return ResponseEntity.ok(status);
    }
}