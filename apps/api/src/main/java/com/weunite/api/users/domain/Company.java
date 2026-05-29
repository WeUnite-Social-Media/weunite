package com.weunite.api.users.domain;

import com.weunite.api.opportunities.domain.Opportunity;
import jakarta.persistence.*;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@Entity
@DiscriminatorValue("COMPANY")
public class Company extends User {
  public Company(String name, String username, String email, String password) {
    super(name, username, email, password);
  }

  @OneToOne(
      mappedBy = "user",
      cascade = CascadeType.ALL,
      orphanRemoval = true,
      fetch = FetchType.LAZY)
  private CompanyProfile profile;

  @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
  private Set<Opportunity> opportunities = new HashSet<>();

  public Set<Opportunity> getOpportunities() {
    return opportunities != null ? Collections.unmodifiableSet(opportunities) : Set.of();
  }

  @PrePersist
  protected void ensureProfileBeforePersist() {
    ensureProfile();
  }

  public void setCNPJ(String CNPJ) {
    ensureProfile().setCNPJ(CNPJ);
  }

  public String getCNPJ() {
    return profile != null ? profile.getCNPJ() : null;
  }

  public void setOpportunities(Set<Opportunity> opportunities) {
    this.opportunities = opportunities;
  }

  public void setProfile(CompanyProfile profile) {
    this.profile = profile;
    if (profile != null) {
      profile.setUser(this);
    }
  }

  public CompanyProfile ensureProfile() {
    if (profile == null) {
      profile = new CompanyProfile(this);
    }

    return profile;
  }
}
