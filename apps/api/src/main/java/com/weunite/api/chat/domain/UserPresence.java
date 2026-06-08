package com.weunite.api.chat.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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

  public UserPresence(Long userId, UserStatus status) {
    this.userId = userId;
    this.status = status != null ? status : UserStatus.OFFLINE;
  }

  @Id private Long userId;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private UserStatus status = UserStatus.OFFLINE;

  @Column(nullable = false)
  private LocalDateTime updatedAt;

  @PrePersist
  @PreUpdate
  protected void updateTimestamp() {
    this.updatedAt = LocalDateTime.now();
  }

  public String getStatusValue() {
    return status.name();
  }
}
