package com.example.weuniteauth.domain.opportunity;

import com.example.weuniteauth.domain.users.Athlete;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Setter
@Getter
@NoArgsConstructor
@Entity
public class Skill {

    public Skill(String name ) {
        this.name = name;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    @JsonIgnore
    @ManyToMany(mappedBy = "skills")
    private Set<Opportunity> opportunities = new HashSet<>();

    @JsonIgnore
    @ManyToMany(mappedBy = "skills")
    private Set<Athlete> athlete = new HashSet<>();

}
