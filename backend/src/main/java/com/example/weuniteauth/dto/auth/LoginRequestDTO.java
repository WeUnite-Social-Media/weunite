package com.example.weuniteauth.dto.auth;

import com.example.weuniteauth.validations.ValidPassword;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;


public record LoginRequestDTO(
        @NotNull(message = "O username não pode ser nulo")
        @Size(min = 5, max = 30, message = "O username deve conter entre 5 e 30 caracteres")
        String username,

        @NotNull(message = "A senha não pode ser nula")
        @ValidPassword
        String password
) {
}
