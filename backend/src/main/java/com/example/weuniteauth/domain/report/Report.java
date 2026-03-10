package com.example.weuniteauth.domain.report;

import com.example.weuniteauth.domain.users.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@Entity
public class Report {

    public enum ReportType {
        POST,
        OPPORTUNITY
    }

    public enum ReportStatus {
        PENDING,
        REVIEWED,
        DISMISSED
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

    @Column
    private Instant updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportStatus status;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.status = ReportStatus.PENDING;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
        this.status = ReportStatus.REVIEWED;
    }
}

