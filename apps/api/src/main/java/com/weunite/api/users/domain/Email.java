package com.weunite.api.users.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.util.Locale;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Embeddable
@NoArgsConstructor
public class Email {

  @Column(name = "email", nullable = false, unique = true, length = 254)
  private String value;

  public Email(String value) {
    this.value = normalize(value);
  }

  public void setValue(String value) {
    this.value = normalize(value);
  }

  private String normalize(String value) {
    if (value == null) {
      return null;
    }

    return value.trim().toLowerCase(Locale.ROOT);
  }
}
