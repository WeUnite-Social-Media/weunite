package com.weunite.api.reports.domain;

import com.weunite.api.users.domain.User;
import jakarta.persistence.*;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
public class Report {

  public enum ReportType {
    POST,
    OPPORTUNITY,
    COMMENT
  }

  public enum ReportStatus {
    PENDING,
    REVIEWED,
    DISMISSED,
    RESOLVED
  }

  public enum ActionTaken {
    NONE,
    CONTENT_REMOVED,
    USER_BANNED,
    USER_SUSPENDED
  }

  public Report(User reporter, ReportType type, Long entityId, String reason) {
    this.reporter = reporter;
    this.type = type;
    this.entityId = entityId;
    this.reason = reason;
  }

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "reporter_id", nullable = false)
  private User reporter;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private ReportType type;

  @Column(nullable = false)
  private Long entityId;

  @Column(length = 500)
  private String reason;

  @Column(nullable = false, updatable = false)
  private Instant createdAt;

  @Column private Instant updatedAt;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private ReportStatus status;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private ActionTaken actionTaken;

  @Column private Instant resolvedAt;

  @Column private Long resolvedByAdminId;

  @PrePersist
  protected void onCreate() {
    this.createdAt = Instant.now();
    this.status = ReportStatus.PENDING;
    this.actionTaken = ActionTaken.NONE;
  }

  @PreUpdate
  protected void onUpdate() {
    this.updatedAt = Instant.now();
  }
}
