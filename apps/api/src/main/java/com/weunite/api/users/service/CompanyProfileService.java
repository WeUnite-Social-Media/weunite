package com.weunite.api.users.service;

import com.weunite.api.users.domain.Company;
import org.springframework.stereotype.Service;

@Service
public class CompanyProfileService {

  public void applyRegistrationDetails(Company company, String cnpj) {
    company.setCNPJ(blankToNull(cnpj));
  }

  private String blankToNull(String value) {
    if (value == null) {
      return null;
    }

    String trimmedValue = value.trim();
    return trimmedValue.isEmpty() ? null : trimmedValue;
  }
}
