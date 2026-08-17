package com.weunite.api.opportunities.domain;

import com.weunite.api.users.domain.Athlete;
import jakarta.persistence.*;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
    name = "saved_opportunities",
    uniqueConstraints = @UniqueConstraint(columnNames = {"athlete_id", "opportunity_id"}))
@Getter
@Setter
@NoArgsConstructor
public class SavedOpportunity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "athlete_id", nullable = false)
  private Athlete athlete;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "opportunity_id", nullable = false)
  private Opportunity opportunity;

  @Column(name = "saved_at", nullable = false, updatable = false)
  private Instant savedAt;

  public SavedOpportunity(Athlete athlete, Opportunity opportunity) {
    this.athlete = athlete;
    this.opportunity = opportunity;
  }

  @PrePersist
  protected void onCreate() {
    this.savedAt = Instant.now();
  }
}
