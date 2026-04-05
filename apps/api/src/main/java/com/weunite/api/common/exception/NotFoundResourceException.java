package com.weunite.api.common.exception;

public class NotFoundResourceException extends BaseException {
  public NotFoundResourceException(String resource) {
    this(resource, false);
  }

  protected NotFoundResourceException(String message, boolean rawMessage) {
    super(rawMessage ? message : message + " não encontrado", "RESOURCE_NOT_FOUND");
  }
}
