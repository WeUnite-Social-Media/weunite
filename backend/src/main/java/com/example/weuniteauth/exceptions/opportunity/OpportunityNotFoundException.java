package com.example.weuniteauth.exceptions.opportunity;

import com.example.weuniteauth.exceptions.NotFoundResourceException;

public class OpportunityNotFoundException extends NotFoundResourceException {
  public OpportunityNotFoundException() {
    super("Publicação");
  }
}
