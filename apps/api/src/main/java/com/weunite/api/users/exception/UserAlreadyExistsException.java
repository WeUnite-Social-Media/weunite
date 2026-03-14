package com.weunite.api.users.exception;

import com.weunite.api.common.exception.DuplicateResourceException;

public class UserAlreadyExistsException extends DuplicateResourceException {
  public UserAlreadyExistsException() {
    super("Usuário já existe");
  }
}
