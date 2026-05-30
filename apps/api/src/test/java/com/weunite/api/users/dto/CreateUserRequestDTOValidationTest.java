package com.weunite.api.users.dto;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import java.util.Set;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class CreateUserRequestDTOValidationTest {

  private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

  @Test
  @DisplayName("Should require CNPJ for company registration")
  void requireCnpjForCompanyRegistration() {
    CreateUserRequestDTO requestDTO =
        new CreateUserRequestDTO(
            "Company User", "company_user", "company@example.com", "123456Cl@", "company", null);

    Set<ConstraintViolation<CreateUserRequestDTO>> violations = validator.validate(requestDTO);

    assertEquals(1, violations.size());
    ConstraintViolation<CreateUserRequestDTO> violation = violations.iterator().next();
    assertEquals("cnpj", violation.getPropertyPath().toString());
    assertEquals("O CNPJ e obrigatorio para empresas", violation.getMessage());
  }

  @Test
  @DisplayName("Should allow athlete registration without CNPJ")
  void allowAthleteRegistrationWithoutCnpj() {
    CreateUserRequestDTO requestDTO =
        new CreateUserRequestDTO(
            "Athlete User", "athlete_user", "athlete@example.com", "123456Cl@", "athlete", null);

    assertTrue(validator.validate(requestDTO).isEmpty());
  }
}
