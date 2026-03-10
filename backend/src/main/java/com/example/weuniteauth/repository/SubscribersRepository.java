package com.example.weuniteauth.repository;

import com.example.weuniteauth.domain.opportunity.Opportunity;
import com.example.weuniteauth.domain.opportunity.Subscriber;
import com.example.weuniteauth.domain.users.Athlete;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SubscribersRepository extends JpaRepository<Subscriber, Integer> {

    Optional<Subscriber> findByAthleteAndOpportunity(Athlete athlete, Opportunity opportunity);

    List<Subscriber> findByOpportunityId(Long opportunityId);
}
