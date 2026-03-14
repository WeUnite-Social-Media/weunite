package com.weunite.api.common.exception;

public class NotFoundResourceException extends BaseException {
  public NotFoundResourceException(String resource) {
    super(resource + " não encontrado", "RESOURCE_NOT_FOUND");
  }
}
