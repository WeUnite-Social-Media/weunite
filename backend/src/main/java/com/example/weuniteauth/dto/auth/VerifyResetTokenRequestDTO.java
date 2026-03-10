package com.example.weuniteauth.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record VerifyResetTokenRequestDTO(
        @NotBlank(message = "O código não pode estar vazio")
        @Size(min = 6, max = 6, message = "O código deve ter 6 caracteres")
        String verificationToken
) {}
