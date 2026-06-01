package com.weunite.api.opportunities.domain;

import com.weunite.api.users.domain.Athlete;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"athlete_id", "opportunity_id"}))
public class Subscriber {
  public Subscriber(Athlete athlete, Opportunity opportunity) {
    this.athlete = athlete;
    this.opportunity = opportunity;
  }

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "opportunity_id", nullable = false)
  private Opportunity opportunity;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "athlete_id", nullable = false)
  private Athlete athlete;
}
