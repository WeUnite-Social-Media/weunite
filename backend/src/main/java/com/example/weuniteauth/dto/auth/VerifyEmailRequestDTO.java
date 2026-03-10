package com.example.weuniteauth.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record VerifyEmailRequestDTO(
        @NotBlank(message = "O código não pode estar vazio")
        @Size(min = 6, max = 6, message = "O código deve conter 6 dígitos")
        String verificationToken
) {}
