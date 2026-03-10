package com.example.weuniteauth.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record SendResetPasswordRequestDTO(
        @NotBlank(message = "O email deve ser preenchido")
        @Email
        String email
) {
}
