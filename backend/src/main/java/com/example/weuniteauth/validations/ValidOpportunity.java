package com.example.weuniteauth.validations;


import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = ValidOpportunityValidator.class)
public @interface ValidOpportunity {
    String message() default "Preencha os campos";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
