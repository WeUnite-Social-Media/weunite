package com.weunite.api.reports.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@Embeddable
public class ReportTarget {

  public ReportTarget(Report.ReportType type, Long entityId) {
    this.type = type;
    this.entityId = entityId;
  }

  @Enumerated(EnumType.STRING)
  @Column(name = "type", nullable = false)
  private Report.ReportType type;

  @Column(name = "entity_id", nullable = false)
  private Long entityId;
}
