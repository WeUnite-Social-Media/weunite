package com.example.weuniteauth.dto.user;

import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record UpdateAthleteRequestDTO(

    @Size(min = 11, message = "O CPF deve conter 11 caracteres")
    String CPF,

    Double height,

    Double weight,

    String footDomain,

    String position,

    LocalDate birthDate

) {


}
