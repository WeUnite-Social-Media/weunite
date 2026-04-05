package com.weunite.api.notifications.domain;

import jakarta.persistence.*;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "tb_notification")
public class Notification {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private Long userId;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 50)
  private NotificationType type;

  @Column(nullable = false)
  private Long actorId;

  @Column(nullable = false)
  private String actorName;

  @Column(nullable = false)
  private String actorUsername;

  @Column private String actorProfileImg;

  @Column(nullable = false)
  private Long relatedEntityId;

  @Column(nullable = false, length = 500)
  private String message;

  @Column(nullable = false)
  private boolean isRead = false;

  @Column(nullable = false, updatable = false)
  private Instant createdAt;

  @PrePersist
  protected void onCreate() {
    createdAt = Instant.now();
  }
}
