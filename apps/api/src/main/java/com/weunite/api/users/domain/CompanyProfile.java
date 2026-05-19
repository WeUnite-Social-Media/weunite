package com.weunite.api.users.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@Entity
@Table(name = "company_profile")
public class CompanyProfile {

  public CompanyProfile(Company company) {
    this.user = company;
  }

  @Id private Long userId;

  @MapsId
  @OneToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id")
  private Company user;

  @Column(name = "cnpj")
  private String CNPJ;

  public void setUser(Company user) {
    this.user = user;
  }

  public void setCNPJ(String CNPJ) {
    this.CNPJ = CNPJ;
  }
}
