package com.weunite.api.posts.exception;

import com.weunite.api.common.exception.NotFoundResourceException;

public class PostNotFoundException extends NotFoundResourceException {
  public PostNotFoundException() {
    super("Publicação");
  }
}
