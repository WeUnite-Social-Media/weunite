package com.weunite.api.common.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@MappedSuperclass
public abstract class AuditableEntity extends CreatedAtEntity {

  @Column private Instant updatedAt;

  @PrePersist
  protected void markUpdatedAtOnCreate() {
    updatedAt = Instant.now();
  }

  @PreUpdate
  protected void markUpdatedAtOnUpdate() {
    updatedAt = Instant.now();
  }
}
