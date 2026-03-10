package com.example.weuniteauth.domain.opportunity;

import com.example.weuniteauth.domain.users.Company;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@Entity
public class Opportunity {

    public Opportunity(Company company, String title, String description, String location, LocalDate date_end, Set<Skill> skills) {
        this.company = company;
        this.title = title;
        this.description = description;
        this.location = location;
        this.dateEnd = date_end;
        this.skills = skills;
    }

    public Opportunity(Company company, String title, String description, String location, LocalDate date_end, Set<Skill> skills, Set<Subscriber> subscribers) {
        this.company = company;
        this.title = title;
        this.description = description;
        this.location = location;
        this.dateEnd = null;
        this.skills = skills;
        this.subscribers = subscribers;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 100, nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    @Column(length = 200)
    private String location;

    @Column(nullable = false)
    private LocalDate dateEnd;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }


    public void addSkill(Skill skill) {
        skills.add(skill);
        skill.getOpportunities().add(this);
    }

    public void removeSkill(Skill skill) {
        skills.remove(skill);
        skill.getOpportunities().remove(this);
    }

    public void addSubscriber(Subscriber subscriber) {
        subscribers.add(subscriber);
        subscriber.setOpportunity(this);
    }

    public void removeSubscriber(Subscriber subscriber) {
        subscribers.remove(subscriber);
        subscriber.setOpportunity(null);
    }

    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "opportunity_skills",
            joinColumns = @JoinColumn(name = "opportunity_id"),
            inverseJoinColumns = @JoinColumn(name = "skills_id")
    )
    private Set<Skill> skills = new HashSet<>();

    @OneToMany(mappedBy = "opportunity", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<Subscriber> subscribers = new HashSet<>();

    @ManyToOne
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

}
