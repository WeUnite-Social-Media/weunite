package com.example.weuniteauth.dto.auth;

import com.example.weuniteauth.validations.ValidPassword;
import jakarta.validation.constraints.NotBlank;

public record ResetPasswordRequestDTO(
        @NotBlank(message = "A nova senha não pode estar vazia")
        @ValidPassword
        String newPassword
) {
}
