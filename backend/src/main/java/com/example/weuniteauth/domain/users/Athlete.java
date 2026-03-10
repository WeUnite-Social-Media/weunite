package com.example.weuniteauth.domain.users;

import com.example.weuniteauth.domain.opportunity.Skill;
import com.example.weuniteauth.domain.opportunity.Subscriber;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@Entity
@DiscriminatorValue("ATHLETE")
public class Athlete extends User {

    public Athlete (String name, String username, String email, String password) {
        super(name, username, email, password);
    }

    @Column
    private String CPF;

    @Column
    private Double height;

    @Column
    private Double weight;

    @Column
    private String footDomain;

    @Column
    private String position;

    @Column
    private LocalDate birthDate;

    @ManyToMany
    @JoinTable(
            name = "user_skills",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "skill_id")
    )
    private Set<Skill> skills = new HashSet<>();

    @OneToMany(mappedBy = "athlete", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<Subscriber> subscriptions = new HashSet<>();
}
