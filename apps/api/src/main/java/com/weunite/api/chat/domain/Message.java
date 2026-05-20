package com.weunite.api.chat.domain;

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
@Table(name = "tb_message")
public class Message {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "conversation_id", nullable = false)
  private Conversation conversation;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "sender_id", nullable = false)
  private User sender;

  @Column(nullable = false, columnDefinition = "TEXT")
  private String content;

  @Column(nullable = false)
  private boolean isRead = false;

  @Column(nullable = false, updatable = false)
  private Instant createdAt;

  @Column private Instant readAt;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private MessageType type = MessageType.TEXT;

  @Column(nullable = false)
  private boolean deleted = false;

  @Column(nullable = false)
  private boolean edited = false;

  @Column private Instant editedAt;

  @PrePersist
  protected void onCreate() {
    this.createdAt = Instant.now();
  }

  public enum MessageType {
    TEXT,
    IMAGE,
    FILE
  }
}
