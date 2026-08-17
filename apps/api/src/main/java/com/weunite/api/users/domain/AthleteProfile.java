package com.weunite.api.users.domain;

import jakarta.persistence.*;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@Entity
@Table(name = "athlete_profile")
public class AthleteProfile {

  public AthleteProfile(Athlete athlete) {
    this.user = athlete;
  }

  @Id private Long userId;

  @MapsId
  @OneToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id")
  private Athlete user;

  @Column(name = "cpf")
  private String CPF;

  @Column private Double height;

  @Column private Double weight;

  @Column private String footDomain;

  @Column private String position;

  @Column private LocalDate birthDate;

  public void setUser(Athlete user) {
    this.user = user;
  }

  public void setCPF(String CPF) {
    this.CPF = CPF;
  }

  public void setHeight(Double height) {
    this.height = height;
  }

  public void setWeight(Double weight) {
    this.weight = weight;
  }

  public void setFootDomain(String footDomain) {
    this.footDomain = footDomain;
  }

  public void setPosition(String position) {
    this.position = position;
  }

  public void setBirthDate(LocalDate birthDate) {
    this.birthDate = birthDate;
  }
}
