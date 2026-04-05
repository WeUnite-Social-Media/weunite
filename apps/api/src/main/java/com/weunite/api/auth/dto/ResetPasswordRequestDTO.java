package com.weunite.api.auth.dto;

import com.weunite.api.common.validation.ValidPassword;
import jakarta.validation.constraints.NotBlank;

public record ResetPasswordRequestDTO(
    @NotBlank(message = "A nova senha não pode estar vazia") @ValidPassword String newPassword) {}
