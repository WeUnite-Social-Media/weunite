package com.example.weuniteauth.exceptions.opportunity;

import com.example.weuniteauth.exceptions.DuplicateResourceException;

public class SkillAlreadyExistsException extends DuplicateResourceException {
    public SkillAlreadyExistsException() {
        super("Skill já existe");
    }
}
