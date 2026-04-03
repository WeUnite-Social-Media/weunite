package com.weunite.api.posts.domain;

import com.weunite.api.users.domain.User;
import jakarta.persistence.*;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(
    name = "tb_post_repost",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "post_id"}))
public class Repost {

  public Repost(Post post, User user) {
    this.post = post;
    this.user = user;
  }

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, updatable = false)
  private Instant createdAt;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "post_id", nullable = false)
  private Post post;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @PrePersist
  protected void onCreate() {
    this.createdAt = Instant.now();
  }
}
