package com.weunite.api.common.validation;

import com.weunite.api.posts.dto.CommentRequestDTO;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class ValidCommentValidator implements ConstraintValidator<ValidComment, CommentRequestDTO> {
  @Override
  public boolean isValid(CommentRequestDTO dto, ConstraintValidatorContext context) {
    return (dto.text() != null && !dto.text().isBlank())
        || (dto.image() != null && !dto.image().isBlank());
  }
}
