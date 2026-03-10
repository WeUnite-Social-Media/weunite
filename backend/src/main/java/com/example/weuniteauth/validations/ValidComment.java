package com.example.weuniteauth.validations;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = ValidCommentValidator.class)
public @interface ValidComment {
    String message() default "Preencha com um texto ou imagem";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
