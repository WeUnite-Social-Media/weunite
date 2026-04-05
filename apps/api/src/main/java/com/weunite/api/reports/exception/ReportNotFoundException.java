package com.weunite.api.reports.exception;

import com.weunite.api.common.exception.NotFoundResourceException;

public class ReportNotFoundException extends NotFoundResourceException {
  public ReportNotFoundException() {
    super("Denúncia não encontrada", true);
  }
}
