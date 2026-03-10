package com.example.weuniteauth.domain.users;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"follower_id", "followed_id"}))
@Entity
public class Follow {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    private Instant updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "follower_id", nullable = false)
    private User follower;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "followed_id", nullable = false)
    private User followed;

    public enum FollowStatus {
        PENDING,
        ACCEPTED,
        REJECTED
    }

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FollowStatus status;

    public Follow(User follower, User followed) {
        this.follower = follower;
        this.followed = followed;
        this.status = followed.isPrivate() ? FollowStatus.PENDING : FollowStatus.ACCEPTED;
    }

    public void accept() {
        this.status = FollowStatus.ACCEPTED;
    }

    public void decline() {
        this.status = FollowStatus.REJECTED;
    }

    public boolean isPending() {
        return this.status == FollowStatus.PENDING;
    }

    public boolean isAccepted() {
        return this.status == FollowStatus.ACCEPTED;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
