package com.weunite.api.common.validation;

import com.weunite.api.users.dto.CreateUserRequestDTO;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class ValidUserRegistrationValidator
    implements ConstraintValidator<ValidUserRegistration, CreateUserRequestDTO> {

  @Override
  public boolean isValid(CreateUserRequestDTO dto, ConstraintValidatorContext context) {
    if (dto == null || dto.role() == null || !dto.role().equalsIgnoreCase("COMPANY")) {
      return true;
    }

    if (dto.cnpj() != null && !dto.cnpj().isBlank()) {
      return true;
    }

    context.disableDefaultConstraintViolation();
    context
        .buildConstraintViolationWithTemplate("O CNPJ e obrigatorio para empresas")
        .addPropertyNode("cnpj")
        .addConstraintViolation();
    return false;
  }
}
