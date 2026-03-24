package com.weunite.api.admin.moderation.controller;

import com.weunite.api.admin.moderation.dto.BanUserRequestDTO;
import com.weunite.api.admin.moderation.dto.SuspendUserRequestDTO;
import com.weunite.api.admin.moderation.service.AdminModerationService;
import com.weunite.api.common.response.ResponseDTO;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/users")
public class AdminModerationController {

  private final AdminModerationService adminModerationService;

  public AdminModerationController(AdminModerationService adminModerationService) {
    this.adminModerationService = adminModerationService;
  }

  @PostMapping("/ban")
  public ResponseEntity<ResponseDTO<String>> banUser(
      @Valid @RequestBody BanUserRequestDTO request) {
    ResponseDTO<String> response = adminModerationService.banUser(request);
    return ResponseEntity.ok(response);
  }

  @PostMapping("/suspend")
  public ResponseEntity<ResponseDTO<String>> suspendUser(
      @Valid @RequestBody SuspendUserRequestDTO request) {
    ResponseDTO<String> response = adminModerationService.suspendUser(request);
    return ResponseEntity.ok(response);
  }
}
