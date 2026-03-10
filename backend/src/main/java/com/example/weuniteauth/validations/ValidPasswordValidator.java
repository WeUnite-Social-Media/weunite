package com.example.weuniteauth.validations;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class ValidPasswordValidator implements ConstraintValidator<ValidPassword, String> {

    private static final int MIN_LENGTH = 8;
    private static final int MAX_LENGTH = 30;

    private static final Pattern SYMBOL_PATTERN = Pattern.compile(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?].*");
    private static final Pattern LOWERCASE_PATTERN = Pattern.compile(".*[a-z].*");
    private static final Pattern UPPERCASE_PATTERN = Pattern.compile(".*[A-Z].*");
    private static final Pattern DIGIT_PATTERN = Pattern.compile(".*[0-9].*");

    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        if (password == null) {
            return false;
        }

        List<String> violations = new ArrayList<>();

        if (password.length() < MIN_LENGTH) {
            violations.add("A senha deve ter no mínimo " + MIN_LENGTH + " caracteres");
        }

        if (password.length() > MAX_LENGTH) {
            violations.add("A senha deve ter no máximo " + MAX_LENGTH + " caracteres");
        }

        // Use os patterns compilados com o método matcher()
        if (!SYMBOL_PATTERN.matcher(password).matches()) {
            violations.add("A senha deve ter no mínimo um símbolo (ex: !@#$%^&*)");
        }

        if (!LOWERCASE_PATTERN.matcher(password).matches()) {
            violations.add("A senha deve ter no mínimo uma letra minúscula");
        }

        if (!UPPERCASE_PATTERN.matcher(password).matches()) {
            violations.add("A senha deve ter no mínimo uma letra maiúscula");
        }

        if (!DIGIT_PATTERN.matcher(password).matches()) {
            violations.add("A senha deve ter no mínimo um número");
        }

        if (!violations.isEmpty()) {
            context.disableDefaultConstraintViolation();

            for (String violation : violations) {
                context.buildConstraintViolationWithTemplate(violation)
                        .addConstraintViolation();
            }
            return false;
        }
        return true;
    }
}