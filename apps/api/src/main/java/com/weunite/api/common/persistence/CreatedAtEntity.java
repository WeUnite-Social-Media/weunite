package com.weunite.api.common.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@MappedSuperclass
public abstract class CreatedAtEntity {

  @Column(nullable = false, updatable = false)
  private Instant createdAt;

  @PrePersist
  protected void markCreatedAt() {
    if (createdAt == null) {
      createdAt = Instant.now();
    }
  }
}
