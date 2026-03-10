package com.example.weuniteauth.exceptions.report;

import com.example.weuniteauth.exceptions.NotFoundResourceException;

public class ReportNotFoundException extends NotFoundResourceException {
    public ReportNotFoundException() {
        super("Denúncia não encontrada");
    }
}

