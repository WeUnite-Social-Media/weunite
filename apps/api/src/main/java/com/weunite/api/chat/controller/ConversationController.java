package com.weunite.api.chat.controller;

import com.weunite.api.chat.dto.ConversationDTO;
import com.weunite.api.chat.dto.CreateConversationRequestDTO;
import com.weunite.api.chat.dto.MessageDTO;
import com.weunite.api.chat.service.ConversationService;
import com.weunite.api.chat.service.MessageService;
import com.weunite.api.common.security.service.AuthenticatedUserService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/conversations")
@Validated
@RequiredArgsConstructor
public class ConversationController {

  private final ConversationService conversationService;
  private final MessageService messageService;
  private final AuthenticatedUserService authenticatedUserService;

  @PostMapping("/create")
  public ResponseEntity<ConversationDTO> createConversation(
      @AuthenticationPrincipal Jwt jwt, @RequestBody @Valid CreateConversationRequestDTO request) {
    authenticatedUserService.requireMatchingUserId(jwt, request.initiatorUserId());
    ConversationDTO conversation = conversationService.createConversation(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(conversation);
  }

  @GetMapping("/user/{userId}")
  public ResponseEntity<List<ConversationDTO>> getUserConversations(
      @AuthenticationPrincipal Jwt jwt, @PathVariable Long userId) {
    authenticatedUserService.requireMatchingUserId(jwt, userId);
    List<ConversationDTO> conversations = conversationService.getUserConversations(userId);
    return ResponseEntity.ok(conversations);
  }

  @GetMapping("/{conversationId}/user/{userId}")
  public ResponseEntity<ConversationDTO> getConversation(
      @AuthenticationPrincipal Jwt jwt,
      @PathVariable Long conversationId,
      @PathVariable Long userId) {
    authenticatedUserService.requireMatchingUserId(jwt, userId);
    ConversationDTO conversation = conversationService.getConversationById(conversationId, userId);
    return ResponseEntity.ok(conversation);
  }

  @GetMapping("/{conversationId}/messages/{userId}")
  public ResponseEntity<List<MessageDTO>> getConversationMessages(
      @AuthenticationPrincipal Jwt jwt,
      @PathVariable Long conversationId,
      @PathVariable Long userId) {
    authenticatedUserService.requireMatchingUserId(jwt, userId);
    List<MessageDTO> messages = messageService.getConversationMessages(conversationId, userId);
    return ResponseEntity.ok(messages);
  }

  @PutMapping("/{conversationId}/read/{userId}")
  public ResponseEntity<Void> markMessagesAsRead(
      @AuthenticationPrincipal Jwt jwt,
      @PathVariable Long conversationId,
      @PathVariable Long userId) {
    authenticatedUserService.requireMatchingUserId(jwt, userId);
    messageService.markMessagesAsRead(conversationId, userId);
    return ResponseEntity.noContent().build();
  }
}
