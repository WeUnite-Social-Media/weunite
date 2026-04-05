package com.weunite.api.follow.exception;

import com.weunite.api.common.exception.NotFoundResourceException;

public class FollowNotFoundException extends NotFoundResourceException {
  public FollowNotFoundException() {
    super("Relacionamento de seguidores não encontrado", true);
  }
}
