package com.weunite.api.chat.domain;

import java.util.Locale;

public enum UserStatus {
  ONLINE,
  OFFLINE;

  public static UserStatus from(String value) {
    if (value == null) {
      return OFFLINE;
    }

    return switch (value.trim().toUpperCase(Locale.ROOT)) {
      case "ONLINE" -> ONLINE;
      case "OFFLINE" -> OFFLINE;
      default -> OFFLINE;
    };
  }
}
