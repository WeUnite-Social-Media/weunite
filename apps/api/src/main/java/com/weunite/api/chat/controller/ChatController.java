package com.weunite.api.chat.controller;

import com.weunite.api.chat.dto.MarkMessagesAsReadRequestDTO;
import com.weunite.api.chat.dto.MessageDTO;
import com.weunite.api.chat.dto.SendMessageRequestDTO;
import com.weunite.api.chat.service.MessageService;
import jakarta.validation.Valid;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
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

  @PostMapping("/messages/upload")
  @ResponseBody
  public ResponseEntity<?> uploadFile(
      @RequestParam("file") MultipartFile file,
      @RequestParam("conversationId") Long conversationId,
      @RequestParam("senderId") Long senderId) {
    try {
      if (file.isEmpty()) {
        return ResponseEntity.badRequest().body(Map.of("error", "Arquivo vazio"));
      }

      if (file.getSize() > 10 * 1024 * 1024) {
        return ResponseEntity.badRequest()
            .body(Map.of("error", "Arquivo muito grande. MÃ¡ximo 10MB"));
      }

      String originalFilename = file.getOriginalFilename();
      String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
      String filename = UUID.randomUUID().toString() + extension;

      Path uploadPath = Paths.get("uploads");
      if (!Files.exists(uploadPath)) {
        Files.createDirectories(uploadPath);
      }

      Path filePath = uploadPath.resolve(filename);
      Files.copy(file.getInputStream(), filePath);

      String fileUrl = "/uploads/" + filename;
      String fileType = file.getContentType().startsWith("image/") ? "IMAGE" : "FILE";

      return ResponseEntity.ok(Map.of("fileUrl", fileUrl, "fileType", fileType));
    } catch (Exception e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }
}
