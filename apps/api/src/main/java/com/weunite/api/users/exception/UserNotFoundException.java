package com.weunite.api.users.exception;

import com.weunite.api.common.exception.NotFoundResourceException;

public class UserNotFoundException extends NotFoundResourceException {
  public UserNotFoundException() {
    super("Usuário");
  }
}
