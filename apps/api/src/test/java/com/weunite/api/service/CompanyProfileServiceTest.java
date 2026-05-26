package com.weunite.api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

import com.weunite.api.users.domain.Company;
import com.weunite.api.users.domain.CompanyProfile;
import com.weunite.api.users.service.CompanyProfileService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

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

  @Test
  @DisplayName("Should prefer split profile CNPJ when resolving company reads")
  void resolveCnpjFromSplitProfile() {
    Company company = new Company();
    CompanyProfile profile = new CompanyProfile(company);
    profile.setCNPJ("12345678000199");
    company.setProfile(profile);
    ReflectionTestUtils.setField(company, "CNPJ", "00000000000000");

    assertEquals("12345678000199", companyProfileService.resolveCnpj(company));
  }

  @Test
  @DisplayName("Should fall back to legacy company CNPJ when split profile is missing")
  void resolveCnpjFromLegacySubtypeWhenSplitProfileIsMissing() {
    Company company = new Company();
    ReflectionTestUtils.setField(company, "CNPJ", "12345678000199");

    assertNull(company.getProfile());
    assertEquals("12345678000199", companyProfileService.resolveCnpj(company));
  }
}
