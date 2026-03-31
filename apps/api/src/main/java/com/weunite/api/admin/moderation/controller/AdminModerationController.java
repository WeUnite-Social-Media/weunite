package com.weunite.api.admin.moderation.controller;

import com.weunite.api.admin.moderation.dto.AdminUserSummaryDTO;
import com.weunite.api.admin.moderation.dto.BanUserRequestDTO;
import com.weunite.api.admin.moderation.dto.ReactivateUserRequestDTO;
import com.weunite.api.admin.moderation.dto.SuspendUserRequestDTO;
import com.weunite.api.admin.moderation.service.AdminModerationService;
import com.weunite.api.common.response.ResponseDTO;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
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

  @GetMapping
  public ResponseEntity<List<AdminUserSummaryDTO>> getUsers() {
    List<AdminUserSummaryDTO> users = adminModerationService.getUsersSummary();
    return ResponseEntity.ok(users);
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

  @PostMapping("/reactivate")
  public ResponseEntity<ResponseDTO<String>> reactivateUser(
      @Valid @RequestBody ReactivateUserRequestDTO request) {
    ResponseDTO<String> response = adminModerationService.reactivateUser(request);
    return ResponseEntity.ok(response);
  }
}
