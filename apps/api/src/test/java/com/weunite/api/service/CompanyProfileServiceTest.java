package com.weunite.api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

import com.weunite.api.users.domain.Company;
import com.weunite.api.users.service.CompanyProfileService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class CompanyProfileServiceTest {

  private final CompanyProfileService companyProfileService = new CompanyProfileService();

  @Test
  @DisplayName("Should initialize company split profile from registration details")
  void applyRegistrationDetails() {
    Company company = new Company();

    companyProfileService.applyRegistrationDetails(company, " 12345678000199 ");

    assertEquals("12345678000199", company.getCNPJ());
    assertNotNull(company.getProfile());
    assertEquals("12345678000199", company.getProfile().getCNPJ());
  }

  @Test
  @DisplayName("Should normalize blank registration company identifier to null")
  void applyBlankRegistrationDetails() {
    Company company = new Company();

    companyProfileService.applyRegistrationDetails(company, " ");

    assertNull(company.getCNPJ());
    assertNotNull(company.getProfile());
    assertNull(company.getProfile().getCNPJ());
  }
}
