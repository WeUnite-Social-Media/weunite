package com.weunite.api.posts.exception;

import com.weunite.api.common.exception.NotFoundResourceException;

public class CommentNotFoundException extends NotFoundResourceException {
  public CommentNotFoundException() {
    super("Comentário");
  }
}
