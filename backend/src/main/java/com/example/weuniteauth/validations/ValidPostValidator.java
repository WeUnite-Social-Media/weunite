package com.example.weuniteauth.validations;

import com.example.weuniteauth.dto.post.PostRequestDTO;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class ValidPostValidator implements ConstraintValidator<ValidPost, PostRequestDTO> {
    @Override
    public boolean isValid(PostRequestDTO dto, ConstraintValidatorContext context) {
        return (dto.text() != null && !dto.text().isBlank());
    }
}