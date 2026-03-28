package com.weunite.api.chat.controller;

import com.weunite.api.chat.dto.MarkMessagesAsReadRequestDTO;
import com.weunite.api.chat.dto.MessageDTO;
import com.weunite.api.chat.dto.SendMessageRequestDTO;
import com.weunite.api.chat.service.MessageService;
import com.weunite.api.common.security.service.AuthenticatedUserService;
import jakarta.validation.Valid;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

@Controller
@RequiredArgsConstructor
@RequestMapping("/api")
public class ChatController {

  private final MessageService messageService;
  private final SimpMessagingTemplate messagingTemplate;
  private final AuthenticatedUserService authenticatedUserService;

  @MessageMapping("/chat.sendMessage")
  public void sendMessage(@Payload @Valid SendMessageRequestDTO request) {
    MessageDTO messageDTO = messageService.sendMessage(request);

    messagingTemplate.convertAndSend("/topic/conversation/" + request.conversationId(), messageDTO);
  }

  @MessageMapping("/chat.markAsRead")
  public void markAsRead(@Payload @Valid MarkMessagesAsReadRequestDTO request) {
    messageService.markMessagesAsRead(request.conversationId(), request.userId());

    messagingTemplate.convertAndSend(
        "/topic/conversation/" + request.conversationId() + "/read", request.userId());
  }

  @DeleteMapping("/messages/{messageId}")
  @ResponseBody
  public ResponseEntity<Map<String, Object>> deleteMessage(
      @AuthenticationPrincipal Jwt jwt, @PathVariable Long messageId, @RequestParam Long userId) {
    Long authenticatedUserId = authenticatedUserService.requireMatchingUserId(jwt, userId);
    MessageDTO deletedMessage = messageService.deleteMessage(messageId, authenticatedUserId);

    Map<String, Object> deleteEvent =
        Map.of(
            "type",
            "DELETE",
            "messageId",
            messageId,
            "forEveryone",
            true,
            "userId",
            authenticatedUserId);

    messagingTemplate.convertAndSend(
        "/topic/conversation/" + deletedMessage.conversationId(), deleteEvent);

    return ResponseEntity.ok(Map.of("success", true));
  }

  @PutMapping("/messages/{messageId}")
  @ResponseBody
  public ResponseEntity<MessageDTO> editMessage(
      @AuthenticationPrincipal Jwt jwt,
      @PathVariable Long messageId,
      @RequestParam Long userId,
      @RequestParam String content) {
    Long authenticatedUserId = authenticatedUserService.requireMatchingUserId(jwt, userId);
    MessageDTO editedMessage = messageService.editMessage(messageId, authenticatedUserId, content);

    messagingTemplate.convertAndSend(
        "/topic/conversation/" + editedMessage.conversationId(), editedMessage);

    return ResponseEntity.ok(editedMessage);
  }

  @PostMapping("/messages/upload")
  @ResponseBody
  public ResponseEntity<?> uploadFile(
      @AuthenticationPrincipal Jwt jwt,
      @RequestParam("file") MultipartFile file,
      @RequestParam("conversationId") Long conversationId,
      @RequestParam("senderId") Long senderId) {
    try {
      authenticatedUserService.requireMatchingUserId(jwt, senderId);

      if (file.isEmpty()) {
        return ResponseEntity.badRequest().body(Map.of("error", "Arquivo vazio"));
      }

      if (file.getSize() > 10 * 1024 * 1024) {
        return ResponseEntity.badRequest()
            .body(Map.of("error", "Arquivo muito grande. Máximo 10MB"));
      }

      String extension = resolveExtension(file);
      String filename = UUID.randomUUID().toString() + extension;

      Path uploadPath = Paths.get("uploads");
      if (!Files.exists(uploadPath)) {
        Files.createDirectories(uploadPath);
      }

      Path filePath = uploadPath.resolve(filename);
      Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

      String fileUrl = "/uploads/" + filename;
      String contentType = file.getContentType();
      String fileType = contentType != null && contentType.startsWith("image/") ? "IMAGE" : "FILE";

      return ResponseEntity.ok(Map.of("fileUrl", fileUrl, "fileType", fileType));
    } catch (Exception e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }

  private String resolveExtension(MultipartFile file) {
    String originalFilename = file.getOriginalFilename();

    if (originalFilename != null) {
      int lastDot = originalFilename.lastIndexOf('.');
      if (lastDot >= 0 && lastDot < originalFilename.length() - 1) {
        return originalFilename.substring(lastDot);
      }
    }

    return inferExtensionFromContentType(file.getContentType());
  }

  private String inferExtensionFromContentType(String contentType) {
    if (contentType == null || contentType.isBlank()) {
      return ".bin";
    }

    String normalizedContentType = contentType.toLowerCase(Locale.ROOT);

    if (normalizedContentType.equals("image/jpeg")) {
      return ".jpg";
    }
    if (normalizedContentType.equals("image/png")) {
      return ".png";
    }
    if (normalizedContentType.equals("image/gif")) {
      return ".gif";
    }
    if (normalizedContentType.equals("image/webp")) {
      return ".webp";
    }
    if (normalizedContentType.equals("application/pdf")) {
      return ".pdf";
    }
    if (normalizedContentType.equals("text/plain")) {
      return ".txt";
    }

    return ".bin";
  }
}
