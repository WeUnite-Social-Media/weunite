package com.weunite.api.users.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Embedded;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Embeddable
@NoArgsConstructor
public class AccountCredentials {

  @Embedded private Email email = new Email();

  @Column(nullable = false)
  private String password;

  @Column(nullable = false)
  private Boolean emailVerified = false;

  @Column private String verificationToken;

  @Column private Instant verificationTokenExpires;

  public AccountCredentials(String email, String password) {
    setEmail(email);
    this.password = password;
    this.emailVerified = false;
  }

  public String getEmailValue() {
    return email != null ? email.getValue() : null;
  }

  public void setEmail(String email) {
    this.email = new Email(email);
  }

  public void setPassword(String password) {
    this.password = password;
  }

  public boolean isEmailVerified() {
    return Boolean.TRUE.equals(emailVerified);
  }

  public void setEmailVerified(Boolean emailVerified) {
    this.emailVerified = emailVerified != null ? emailVerified : Boolean.FALSE;
  }

  public void setVerificationToken(String verificationToken) {
    this.verificationToken = verificationToken;
  }

  public void setVerificationTokenExpires(Instant verificationTokenExpires) {
    this.verificationTokenExpires = verificationTokenExpires;
  }

  public void normalizeFlags() {
    setEmailVerified(emailVerified);
  }
}
