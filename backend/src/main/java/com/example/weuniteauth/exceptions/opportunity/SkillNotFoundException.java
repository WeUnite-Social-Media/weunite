package com.example.weuniteauth.exceptions.opportunity;

import com.example.weuniteauth.exceptions.NotFoundResourceException;

public class SkillNotFoundException extends NotFoundResourceException {
    public SkillNotFoundException() {
        super("Está skill não foi encontrada");
    }
}
