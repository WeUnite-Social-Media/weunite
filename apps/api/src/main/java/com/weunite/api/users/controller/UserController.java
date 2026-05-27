package com.weunite.api.users.controller;

import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.common.security.service.AuthenticatedUserService;
import com.weunite.api.users.dto.UpdateUserRequestDTO;
import com.weunite.api.users.dto.UserDTO;
import com.weunite.api.users.service.UserService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/user")
@Validated
public class UserController {

  private final UserService userService;
  private final AuthenticatedUserService authenticatedUserService;

  public UserController(
      UserService userService, AuthenticatedUserService authenticatedUserService) {
    this.userService = userService;
    this.authenticatedUserService = authenticatedUserService;
  }

  @GetMapping("/username/{username}")
  public ResponseEntity<ResponseDTO<UserDTO>> getUser(@PathVariable String username) {
    ResponseDTO<UserDTO> userDTO = userService.getUser(username);
    return ResponseEntity.ok(userDTO);
  }

  @GetMapping("/id/{id}")
  public ResponseEntity<ResponseDTO<UserDTO>> getUserById(@PathVariable Long id) {
    ResponseDTO<UserDTO> userDTO = userService.getUser(id);
    return ResponseEntity.ok(userDTO);
  }

  @DeleteMapping("/delete/{username}")
  public ResponseEntity<ResponseDTO<UserDTO>> deleteUser(
      @AuthenticationPrincipal Jwt jwt, @PathVariable String username) {
    String authenticatedUsername = authenticatedUserService.requireMatchingUsername(jwt, username);
    ResponseDTO<UserDTO> userDTO = userService.deleteUser(authenticatedUsername);
    return ResponseEntity.ok(userDTO);
  }

  @DeleteMapping("/banner/delete/{username}")
  public ResponseEntity<ResponseDTO<UserDTO>> deleteBanner(
      @AuthenticationPrincipal Jwt jwt, @PathVariable String username) {
    String authenticatedUsername = authenticatedUserService.requireMatchingUsername(jwt, username);
    ResponseDTO<UserDTO> userDTO = userService.deleteBanner(authenticatedUsername);
    return ResponseEntity.ok(userDTO);
  }

  @PutMapping("/update/{username}")
  public ResponseEntity<ResponseDTO<UserDTO>> updateUser(
      @AuthenticationPrincipal Jwt jwt,
      @PathVariable String username,
      @RequestPart(value = "user") UpdateUserRequestDTO requestDTO,
      @RequestPart(value = "profileImage", required = false) MultipartFile profileImage,
      @RequestPart(value = "bannerImage", required = false) MultipartFile bannerImage) {
    String authenticatedUsername = authenticatedUserService.requireMatchingUsername(jwt, username);
    ResponseDTO<UserDTO> userDTO =
        userService.updateUser(requestDTO, authenticatedUsername, profileImage, bannerImage);
    return ResponseEntity.ok(userDTO);
  }

  @GetMapping("/search")
  public ResponseEntity<ResponseDTO<List<UserDTO>>> searchUsers(@RequestParam String query) {
    ResponseDTO<List<UserDTO>> response = userService.searchUsers(query);
    return ResponseEntity.ok(response);
  }
}
