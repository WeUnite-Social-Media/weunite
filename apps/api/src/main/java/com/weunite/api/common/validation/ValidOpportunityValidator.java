package com.weunite.api.common.validation;

import com.weunite.api.opportunities.dto.OpportunityRequestDTO;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class ValidOpportunityValidator
    implements ConstraintValidator<ValidOpportunity, OpportunityRequestDTO> {
  @Override
  public boolean isValid(OpportunityRequestDTO dto, ConstraintValidatorContext context) {
    if (dto == null) {
      return true;
    }

    List<String> violations = new ArrayList<>();

    if (dto.title() == null || dto.title().isBlank()) {
      violations.add("O tÃ­tulo Ã© obrigatÃ³rio");
    } else if (dto.title().length() < 3 || dto.title().length() > 120) {
      violations.add("O tÃ­tulo deve ter entre 3 e 120 caracteres");
    }

    if (dto.description() == null || dto.description().isBlank()) {
      violations.add("A descriÃ§Ã£o Ã© obrigatÃ³ria");
    } else if (dto.description().length() < 10 || dto.description().length() > 500) {
      violations.add("A descriÃ§Ã£o deve ter entre 10 e 500 caracteres");
    }

    if (dto.location() == null || dto.location().isBlank()) {
      violations.add("A localizaÃ§Ã£o Ã© obrigatÃ³ria");
    }

    if (dto.dateEnd() == null) {
      violations.add("A data de tÃ©rmino Ã© obrigatÃ³ria");
    } else if (dto.dateEnd().isBefore(LocalDate.now())) {
      violations.add("A data de tÃ©rmino nÃ£o pode estar no passado");
    }

    if (dto.skills() == null || dto.skills().isEmpty()) {
      violations.add("Selecione pelo menos uma habilidade");
    } else if (dto.skills().stream()
        .anyMatch(skill -> skill == null || skill.getName() == null || skill.getName().isBlank())) {
      violations.add("As habilidades precisam ter nomes vÃ¡lidos");
    }

    if (!violations.isEmpty()) {
      context.disableDefaultConstraintViolation();
      for (String violation : violations) {
        context.buildConstraintViolationWithTemplate(violation).addConstraintViolation();
      }
      return false;
    }

    return true;
  }
}
