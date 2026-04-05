package com.weunite.api.users.dto;

import com.weunite.api.opportunities.dto.SkillDTO;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

public record UpdateUserRequestDTO(
    @Size(min = 5, max = 100, message = "O nome deve conter entre 5 e 100 caracteres") String name,
    @Size(min = 5, max = 30, message = "O nome de usuario deve conter entre 5 e 30 caracteres")
        String username,
    @Size(max = 500, message = "A bio deve conter no maximo 500 caracteres") String bio,
    Boolean isPrivate,
    Double height,
    Double weight,
    String footDomain,
    String position,
    LocalDate birthDate,
    List<SkillDTO> skills) {}
