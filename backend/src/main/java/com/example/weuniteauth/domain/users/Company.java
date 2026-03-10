package com.example.weuniteauth.domain.users;

import com.example.weuniteauth.domain.opportunity.Opportunity;
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
@DiscriminatorValue("COMPANY")
public class Company  extends User {
    public Company(String name, String username, String email, String password) {
        super(name, username, email, password);
    }

    @Column
    private String CNPJ;

    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<Opportunity> opportunities = new HashSet<>();

}
