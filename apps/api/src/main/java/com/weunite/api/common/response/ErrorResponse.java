package com.weunite.api.common.response;

import java.time.Instant;
import lombok.Getter;

@Getter
public class ErrorResponse {
  private String message;
  private String error;
  private Instant timestamp;

  public ErrorResponse(String message, String error) {
    this.message = message;
    this.error = error;
    this.timestamp = Instant.now();
  }
}
