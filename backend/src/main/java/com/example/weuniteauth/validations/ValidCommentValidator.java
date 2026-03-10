package com.example.weuniteauth.validations;

import com.example.weuniteauth.dto.comment.CommentRequestDTO;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class ValidCommentValidator implements ConstraintValidator<ValidComment, CommentRequestDTO> {
    @Override
    public boolean isValid(CommentRequestDTO dto, ConstraintValidatorContext context) {
        return (dto.text() != null && !dto.text().isBlank()) ||
                (dto.image() != null && !dto.image().isBlank());
    }
}
