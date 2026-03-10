package com.example.weuniteauth.controller;

import com.example.weuniteauth.dto.AuthDTO;
import com.example.weuniteauth.dto.ResponseDTO;
import com.example.weuniteauth.dto.auth.*;
import com.example.weuniteauth.dto.user.CreateUserRequestDTO;
import com.example.weuniteauth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Validated
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<ResponseDTO<AuthDTO>> signup(@RequestBody @Valid CreateUserRequestDTO createUserRequestDTO) {
        ResponseDTO<AuthDTO> signUpResponseDTO = authService.signUp(createUserRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(signUpResponseDTO);
    }

    @PostMapping("/signup/company")
    public ResponseEntity<ResponseDTO<AuthDTO>> signupCompany(@RequestBody @Valid CreateUserRequestDTO createUserRequestDTO) {
        ResponseDTO<AuthDTO> signUpResponseDTO = authService.signUp(createUserRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(signUpResponseDTO);
    }

    @PostMapping("/login")
    public ResponseEntity<ResponseDTO<AuthDTO>> login(@RequestBody @Valid LoginRequestDTO loginRequestDTO) {
        ResponseDTO<AuthDTO> loginRequest = authService.login(loginRequestDTO);
        return ResponseEntity.status(HttpStatus.OK).body(loginRequest);
    }

    @PostMapping("/verify-email/{email}")
    public ResponseEntity<ResponseDTO<AuthDTO>> verifyEmail(@RequestBody VerifyEmailRequestDTO verifyEmailRequestDTO, @PathVariable String email) {
        ResponseDTO<AuthDTO> verifyEmailResponseDTO = authService.verifyEmail(verifyEmailRequestDTO, email);
        return ResponseEntity.status(HttpStatus.OK).body(verifyEmailResponseDTO);
    }

    @PostMapping("/send-reset-password")
    public ResponseEntity<ResponseDTO<AuthDTO>> sendResetPassword(@RequestBody SendResetPasswordRequestDTO sendResetPasswordRequestDTO) {
        ResponseDTO<AuthDTO> sendResetPasswordResponseDTO = authService.sendResetPassword(sendResetPasswordRequestDTO);
        return ResponseEntity.status(HttpStatus.OK).body(sendResetPasswordResponseDTO);
    }

    @PostMapping("/verify-reset-token/{email}")
    public ResponseEntity<ResponseDTO<AuthDTO>> verifyResetToken(@RequestBody VerifyResetTokenRequestDTO verifyResetTokenRequestDTO, @PathVariable String email) {
        ResponseDTO<AuthDTO> verifyResetTokenResponseDTO = authService.verifyResetPasswordToken(verifyResetTokenRequestDTO, email);
        return ResponseEntity.status(HttpStatus.OK).body(verifyResetTokenResponseDTO);
    }

    @PostMapping("/reset-password/{verificationToken}")
    public ResponseEntity<ResponseDTO<AuthDTO>> resetPassword(@RequestBody @Valid ResetPasswordRequestDTO resetPasswordRequestDTO, @PathVariable String verificationToken) {
        ResponseDTO<AuthDTO> resetPasswordResponseDTO = authService.resetPassword(resetPasswordRequestDTO, verificationToken);
        return ResponseEntity.status(HttpStatus.OK).body(resetPasswordResponseDTO);
    }
}
