package com.weunite.api.admin.moderation.controller;

import com.weunite.api.admin.moderation.dto.AdminUserSummaryDTO;
import com.weunite.api.admin.moderation.dto.BanUserRequestDTO;
import com.weunite.api.admin.moderation.dto.ReactivateUserRequestDTO;
import com.weunite.api.admin.moderation.dto.SuspendUserRequestDTO;
import com.weunite.api.admin.moderation.service.AdminModerationService;
import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.common.security.service.AuthenticatedUserService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/users")
public class AdminModerationController {

  private final AdminModerationService adminModerationService;
  private final AuthenticatedUserService authenticatedUserService;

  public AdminModerationController(
      AdminModerationService adminModerationService,
      AuthenticatedUserService authenticatedUserService) {
    this.adminModerationService = adminModerationService;
    this.authenticatedUserService = authenticatedUserService;
  }

  @GetMapping
  public ResponseEntity<List<AdminUserSummaryDTO>> getUsers() {
    List<AdminUserSummaryDTO> users = adminModerationService.getUsersSummary();
    return ResponseEntity.ok(users);
  }

  @PostMapping("/ban")
  public ResponseEntity<ResponseDTO<String>> banUser(
      @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody BanUserRequestDTO request) {
    Long adminId = authenticatedUserService.requireAdminUserId(jwt);
    ResponseDTO<String> response = adminModerationService.banUser(request, adminId);
    return ResponseEntity.ok(response);
  }

  @PostMapping("/suspend")
  public ResponseEntity<ResponseDTO<String>> suspendUser(
      @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody SuspendUserRequestDTO request) {
    Long adminId = authenticatedUserService.requireAdminUserId(jwt);
    ResponseDTO<String> response = adminModerationService.suspendUser(request, adminId);
    return ResponseEntity.ok(response);
  }

  @PostMapping("/reactivate")
  public ResponseEntity<ResponseDTO<String>> reactivateUser(
      @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody ReactivateUserRequestDTO request) {
    authenticatedUserService.requireAdminUserId(jwt);
    ResponseDTO<String> response = adminModerationService.reactivateUser(request);
    return ResponseEntity.ok(response);
  }
}
