package com.example.weuniteauth.controller;

import com.example.weuniteauth.dto.chat.ConversationDTO;
import com.example.weuniteauth.dto.chat.CreateConversationRequestDTO;
import com.example.weuniteauth.dto.chat.MessageDTO;
import com.example.weuniteauth.service.ConversationService;
import com.example.weuniteauth.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conversations")
@Validated
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService conversationService;
    private final MessageService messageService;

    @PostMapping("/create")
    public ResponseEntity<ConversationDTO> createConversation(@RequestBody @Valid CreateConversationRequestDTO request) {
        ConversationDTO conversation = conversationService.createConversation(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(conversation);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ConversationDTO>> getUserConversations(@PathVariable Long userId) {
        List<ConversationDTO> conversations = conversationService.getUserConversations(userId);
        return ResponseEntity.ok(conversations);
    }

    @GetMapping("/{conversationId}/user/{userId}")
    public ResponseEntity<ConversationDTO> getConversation(@PathVariable Long conversationId,
                                                           @PathVariable Long userId) {
        ConversationDTO conversation = conversationService.getConversationById(conversationId, userId);
        return ResponseEntity.ok(conversation);
    }

    @GetMapping("/{conversationId}/messages/{userId}")
    public ResponseEntity<List<MessageDTO>> getConversationMessages(@PathVariable Long conversationId,
                                                                    @PathVariable Long userId) {
        List<MessageDTO> messages = messageService.getConversationMessages(conversationId, userId);
        return ResponseEntity.ok(messages);
    }

    @PutMapping("/{conversationId}/read/{userId}")
    public ResponseEntity<Void> markMessagesAsRead(@PathVariable Long conversationId,
                                                   @PathVariable Long userId) {
        messageService.markMessagesAsRead(conversationId, userId);
        return ResponseEntity.noContent().build();
    }
}
