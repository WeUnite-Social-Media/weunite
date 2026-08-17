package com.weunite.api.chat.domain;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class UserStatusTest {

  @Test
  @DisplayName("Should normalize supported status values")
  void normalizeSupportedValues() {
    assertEquals(UserStatus.ONLINE, UserStatus.from("online"));
    assertEquals(UserStatus.OFFLINE, UserStatus.from(" offline "));
  }

  @Test
  @DisplayName("Should default unsupported status values to offline")
  void defaultUnsupportedValuesToOffline() {
    assertEquals(UserStatus.OFFLINE, UserStatus.from(null));
    assertEquals(UserStatus.OFFLINE, UserStatus.from(""));
    assertEquals(UserStatus.OFFLINE, UserStatus.from("busy"));
  }
}
