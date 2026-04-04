package com.weunite.api.chat.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class UserPresence {

  public UserPresence(Long userId, String status) {
    this.userId = userId;
    this.status = status;
  }

  @Id
  private Long userId;

  @Column(nullable = false, length = 20)
  private String status;

  @Column(nullable = false)
  private LocalDateTime updatedAt;

  @PrePersist
  @PreUpdate
  protected void updateTimestamp() {
    this.updatedAt = LocalDateTime.now();
  }
}
