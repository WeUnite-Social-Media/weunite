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
    ensureProfile().setCPF(CPF);
  }

  public void setHeight(Double height) {
    ensureProfile().setHeight(height);
  }

  public void setWeight(Double weight) {
    ensureProfile().setWeight(weight);
  }

  public void setFootDomain(String footDomain) {
    ensureProfile().setFootDomain(footDomain);
  }

  public void setPosition(String position) {
    ensureProfile().setPosition(position);
  }

  public void setBirthDate(LocalDate birthDate) {
    ensureProfile().setBirthDate(birthDate);
  }

  public String getCPF() {
    return profile != null ? profile.getCPF() : null;
  }

  public Double getHeight() {
    return profile != null ? profile.getHeight() : null;
  }

  public Double getWeight() {
    return profile != null ? profile.getWeight() : null;
  }

  public String getFootDomain() {
    return profile != null ? profile.getFootDomain() : null;
  }

  public String getPosition() {
    return profile != null ? profile.getPosition() : null;
  }

  public LocalDate getBirthDate() {
    return profile != null ? profile.getBirthDate() : null;
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
    }
  }

  public AthleteProfile ensureProfile() {
    if (profile == null) {
      profile = new AthleteProfile(this);
    }

    return profile;
  }
}
