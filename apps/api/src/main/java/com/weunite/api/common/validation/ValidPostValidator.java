package com.weunite.api.common.validation;

import com.weunite.api.posts.dto.PostRequestDTO;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class ValidPostValidator implements ConstraintValidator<ValidPost, PostRequestDTO> {
  @Override
  public boolean isValid(PostRequestDTO dto, ConstraintValidatorContext context) {
    return (dto.text() != null && !dto.text().isBlank());
  }
}
