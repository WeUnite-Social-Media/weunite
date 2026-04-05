package com.weunite.api.common.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = ValidPostValidator.class)
public @interface ValidPost {
  String message() default "Preencha com um texto ou imagem";

  Class<?>[] groups() default {};

  Class<? extends Payload>[] payload() default {};
}
