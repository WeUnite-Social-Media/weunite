package com.weunite.api.opportunities.domain;

import com.weunite.api.users.domain.Athlete;
import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
@Entity
public class Skill {

  public Skill(String name) {
    this.name = name;
  }

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(unique = true, nullable = false)
  private String name;

  @ManyToMany(mappedBy = "skills")
  private Set<Opportunity> opportunities = new HashSet<>();

  @ManyToMany(mappedBy = "skills")
  private Set<Athlete> athlete = new HashSet<>();
}
