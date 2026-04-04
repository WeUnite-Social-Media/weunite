package com.weunite.api.chat.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.weunite.api.chat.service.MessageService;
import com.weunite.api.common.security.service.AuthenticatedUserService;
import com.weunite.api.common.storage.service.CloudinaryService;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.oauth2.jwt.Jwt;

@ExtendWith(MockitoExtension.class)
class ChatControllerTest {

  @Mock private MessageService messageService;
  @Mock private SimpMessagingTemplate messagingTemplate;
  @Mock private AuthenticatedUserService authenticatedUserService;
  @Mock private CloudinaryService cloudinaryService;

  @InjectMocks private ChatController chatController;

  @Test
  @DisplayName("Should upload chat attachments through Cloudinary")
  void uploadFileUsesCloudinaryService() {
    Jwt jwt = mock(Jwt.class);
    MockMultipartFile file =
        new MockMultipartFile("file", "photo.png", "image/png", "image-content".getBytes());

    when(authenticatedUserService.requireMatchingUserId(jwt, 5L)).thenReturn(5L);
    when(cloudinaryService.uploadChatAttachment(file, 11L, 5L))
        .thenReturn("https://cdn.example/chat/photo.png");

    ResponseEntity<?> response = chatController.uploadFile(jwt, file, 11L, 5L);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals(
        Map.of("fileUrl", "https://cdn.example/chat/photo.png", "fileType", "IMAGE"),
        response.getBody());
    verify(cloudinaryService).uploadChatAttachment(file, 11L, 5L);
  }

  @Test
  @DisplayName("Should reject empty chat uploads before calling Cloudinary")
  void uploadFileRejectsEmptyFile() {
    Jwt jwt = mock(Jwt.class);
    MockMultipartFile file =
        new MockMultipartFile("file", "empty.txt", "text/plain", new byte[0]);

    when(authenticatedUserService.requireMatchingUserId(jwt, 5L)).thenReturn(5L);

    ResponseEntity<?> response = chatController.uploadFile(jwt, file, 11L, 5L);

    assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    assertEquals(Map.of("error", "Arquivo vazio"), response.getBody());
    verifyNoInteractions(cloudinaryService);
  }
}
