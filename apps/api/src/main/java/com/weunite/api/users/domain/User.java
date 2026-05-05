package com.weunite.api.users.domain;

import com.weunite.api.follow.domain.Follow;
import com.weunite.api.posts.domain.Post;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@Entity
@NoArgsConstructor
@Table(name = "tb_user")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "dtype", discriminatorType = DiscriminatorType.STRING)
@DiscriminatorValue("USER")
public class User {

  public User(String name, String username, String email, String password) {
    this.name = name;
    this.username = username;
    this.accountCredentials = new AccountCredentials(email, password);
    this.isBanned = false;
    this.isSuspended = false;
    this.isPrivate = false;
  }

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, updatable = false)
  private Instant createdAt;

  private Instant updatedAt;

  @Column(nullable = false, length = 100)
  private String name;

  @Column(nullable = false, unique = true, length = 30)
  private String username;

  @Embedded private AccountCredentials accountCredentials = new AccountCredentials();

  @Column(nullable = false)
  private Boolean isBanned;

  @Column(nullable = false)
  private Boolean isSuspended;

  @Column private Instant bannedAt;

  @Column(length = 500)
  private String bannedReason;

  @Column private Long bannedByAdminId;

  @Column private Instant suspendedUntil;

  @Column(length = 500)
  private String suspensionReason;

  @Column(nullable = false)
  private Boolean isPrivate;

  @Column private String profileImg;

  @Column private String bannerImg;

  @Column(length = 500)
  private String bio;

  @Column(nullable = false)
  @ManyToMany(fetch = FetchType.EAGER)
  @JoinTable(
      name = "tb_user_roles",
      joinColumns = @JoinColumn(name = "user_id"),
      inverseJoinColumns = @JoinColumn(name = "role_id"))
  private Set<Role> role = new HashSet<>();

  @OneToMany(mappedBy = "followed", cascade = CascadeType.ALL, orphanRemoval = true)
  private Set<Follow> followers = new HashSet<>();

  @OneToMany(mappedBy = "follower", cascade = CascadeType.ALL, orphanRemoval = true)
  private Set<Follow> following = new HashSet<>();

  @OneToMany(
      mappedBy = "user",
      cascade = CascadeType.ALL,
      orphanRemoval = true,
      fetch = FetchType.LAZY)
  private Set<Post> posts = new HashSet<>();

  @PrePersist
  protected void onCreate() {
    normalizeBooleanFlags();
    this.createdAt = Instant.now();
  }

  @PreUpdate
  protected void onUpdate() {
    normalizeBooleanFlags();
    this.updatedAt = Instant.now();
  }

  @PostLoad
  protected void onLoad() {
    normalizeBooleanFlags();
  }

  public boolean isEmailVerified() {
    return getAccountCredentials().isEmailVerified();
  }

  public void setEmailVerified(Boolean emailVerified) {
    getAccountCredentials().setEmailVerified(emailVerified);
  }

  public String getEmail() {
    return getAccountCredentials().getEmailValue();
  }

  public void setEmail(String email) {
    getAccountCredentials().setEmail(email);
  }

  public String getPassword() {
    return getAccountCredentials().getPassword();
  }

  public void setPassword(String password) {
    getAccountCredentials().setPassword(password);
  }

  public String getVerificationToken() {
    return getAccountCredentials().getVerificationToken();
  }

  public void setVerificationToken(String verificationToken) {
    getAccountCredentials().setVerificationToken(verificationToken);
  }

  public Instant getVerificationTokenExpires() {
    return getAccountCredentials().getVerificationTokenExpires();
  }

  public void setVerificationTokenExpires(Instant verificationTokenExpires) {
    getAccountCredentials().setVerificationTokenExpires(verificationTokenExpires);
  }

  public boolean isBanned() {
    return Boolean.TRUE.equals(isBanned);
  }

  public void setBanned(Boolean banned) {
    this.isBanned = defaultBoolean(banned);
  }

  public boolean isSuspended() {
    return Boolean.TRUE.equals(isSuspended);
  }

  public void setSuspended(Boolean suspended) {
    this.isSuspended = defaultBoolean(suspended);
  }

  public boolean isPrivate() {
    return Boolean.TRUE.equals(isPrivate);
  }

  public void setVisibility(boolean isPrivate) {
    this.isPrivate = defaultBoolean(isPrivate);
  }

  public void setPrivate(Boolean isPrivate) {
    this.isPrivate = defaultBoolean(isPrivate);
  }

  private void normalizeBooleanFlags() {
    getAccountCredentials().normalizeFlags();
    isBanned = defaultBoolean(isBanned);
    isSuspended = defaultBoolean(isSuspended);
    isPrivate = defaultBoolean(isPrivate);
  }

  public AccountCredentials getAccountCredentials() {
    if (accountCredentials == null) {
      accountCredentials = new AccountCredentials();
    }

    return accountCredentials;
  }

  private Boolean defaultBoolean(Boolean value) {
    return value != null ? value : Boolean.FALSE;
  }
}
