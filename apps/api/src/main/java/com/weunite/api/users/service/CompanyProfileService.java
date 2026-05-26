package com.weunite.api.users.service;

import com.weunite.api.users.domain.Company;
import com.weunite.api.users.domain.CompanyProfile;
import org.springframework.stereotype.Service;

@Service
public class CompanyProfileService {

  public void applyRegistrationDetails(Company company, String cnpj) {
    company.setCNPJ(blankToNull(cnpj));
  }

  public String resolveCnpj(Company company) {
    CompanyProfile profile = company.getProfile();
    return profile != null ? profile.getCNPJ() : company.getCNPJ();
  }

  private String blankToNull(String value) {
    if (value == null) {
      return null;
    }

    String trimmedValue = value.trim();
    return trimmedValue.isEmpty() ? null : trimmedValue;
  }
}
