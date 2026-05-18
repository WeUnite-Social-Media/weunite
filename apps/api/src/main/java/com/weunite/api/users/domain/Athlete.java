package com.weunite.api.users.domain;

import com.weunite.api.opportunities.domain.Skill;
import com.weunite.api.opportunities.domain.Subscriber;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
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

  @ManyToMany
  @JoinTable(
      name = "user_skills",
      joinColumns = @JoinColumn(name = "user_id"),
      inverseJoinColumns = @JoinColumn(name = "skill_id"))
  private Set<Skill> skills = new HashSet<>();

  @OneToMany(mappedBy = "athlete", fetch = FetchType.LAZY)
  private Set<Subscriber> subscriptions = new HashSet<>();
}
