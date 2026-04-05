package com.weunite.api.chat.domain;

import com.weunite.api.users.domain.User;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "tb_conversation")
public class Conversation {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToMany(fetch = FetchType.EAGER)
  @JoinTable(
      name = "tb_conversation_participants",
      joinColumns = @JoinColumn(name = "conversation_id"),
      inverseJoinColumns = @JoinColumn(name = "user_id"))
  private Set<User> participants = new HashSet<>();

  @OneToMany(
      mappedBy = "conversation",
      cascade = CascadeType.ALL,
      orphanRemoval = true,
      fetch = FetchType.LAZY)
  private Set<Message> messages = new HashSet<>();

  @Column(nullable = false, updatable = false)
  private Instant createdAt;

  @Column private Instant updatedAt;

  @PrePersist
  protected void onCreate() {
    this.createdAt = Instant.now();
    this.updatedAt = Instant.now();
  }

  @PreUpdate
  protected void onUpdate() {
    this.updatedAt = Instant.now();
  }
}
