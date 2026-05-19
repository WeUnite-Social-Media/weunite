package com.weunite.api.users.domain;

import com.weunite.api.opportunities.domain.Skill;
import com.weunite.api.opportunities.domain.Subscriber;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@Entity
@DiscriminatorValue("ATHLETE")
public class Athlete extends User {

  public Athlete(String name, String username, String email, String password) {
    super(name, username, email, password);
  }

  @Column private String CPF;

  @Column private Double height;

  @Column private Double weight;

  @Column private String footDomain;

  @Column private String position;

  @Column private LocalDate birthDate;

  @OneToOne(
      mappedBy = "user",
      cascade = CascadeType.ALL,
      orphanRemoval = true,
      fetch = FetchType.LAZY)
  private AthleteProfile profile;

  @ManyToMany
  @JoinTable(
      name = "user_skills",
      joinColumns = @JoinColumn(name = "user_id"),
      inverseJoinColumns = @JoinColumn(name = "skill_id"))
  private Set<Skill> skills = new HashSet<>();

  @OneToMany(mappedBy = "athlete", fetch = FetchType.LAZY)
  private Set<Subscriber> subscriptions = new HashSet<>();

  @PrePersist
  protected void ensureProfileBeforePersist() {
    ensureProfile();
  }

  public void setCPF(String CPF) {
    this.CPF = CPF;
    ensureProfile().setCPF(CPF);
  }

  public void setHeight(Double height) {
    this.height = height;
    ensureProfile().setHeight(height);
  }

  public void setWeight(Double weight) {
    this.weight = weight;
    ensureProfile().setWeight(weight);
  }

  public void setFootDomain(String footDomain) {
    this.footDomain = footDomain;
    ensureProfile().setFootDomain(footDomain);
  }

  public void setPosition(String position) {
    this.position = position;
    ensureProfile().setPosition(position);
  }

  public void setBirthDate(LocalDate birthDate) {
    this.birthDate = birthDate;
    ensureProfile().setBirthDate(birthDate);
  }

  public void setSkills(Set<Skill> skills) {
    this.skills = skills;
  }

  public void setSubscriptions(Set<Subscriber> subscriptions) {
    this.subscriptions = subscriptions;
  }

  public void setProfile(AthleteProfile profile) {
    this.profile = profile;
    if (profile != null) {
      profile.setUser(this);
      this.CPF = profile.getCPF();
      this.height = profile.getHeight();
      this.weight = profile.getWeight();
      this.footDomain = profile.getFootDomain();
      this.position = profile.getPosition();
      this.birthDate = profile.getBirthDate();
    }
  }

  public AthleteProfile ensureProfile() {
    if (profile == null) {
      profile = new AthleteProfile(this);
      profile.setCPF(CPF);
      profile.setHeight(height);
      profile.setWeight(weight);
      profile.setFootDomain(footDomain);
      profile.setPosition(position);
      profile.setBirthDate(birthDate);
    }

    return profile;
  }
}
