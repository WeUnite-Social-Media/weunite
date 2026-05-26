package com.weunite.api.users.dto;

import com.weunite.api.common.validation.ValidPassword;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateUserRequestDTO(
    @NotBlank(message = "O nome não pode estar vazio")
        @Size(min = 5, max = 100, message = "O nome deve conter entre 5 e 100 caracteres")
        String name,
    @NotBlank(message = "O nome de usuário não pode estar vazio")
        @Size(min = 5, max = 30, message = "O nome de usuário deve conter entre 5 e 30 caracteres")
        String username,
    @NotBlank(message = "O email não pode estar vazio")
        @Email(message = "Este campo deve ter o formato: exemplo@provedor.com")
        String email,
    @NotBlank(message = "A senha não pode estar vazia") @ValidPassword String password,
    @NotBlank String role,
    @Pattern(regexp = "\\d{14}", message = "O CNPJ deve conter 14 digitos") String cnpj) {}
