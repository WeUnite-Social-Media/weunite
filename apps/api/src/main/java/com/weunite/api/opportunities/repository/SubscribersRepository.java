package com.weunite.api.opportunities.repository;

import com.weunite.api.opportunities.domain.Opportunity;
import com.weunite.api.opportunities.domain.Subscriber;
import com.weunite.api.users.domain.Athlete;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubscribersRepository extends JpaRepository<Subscriber, Long> {

  Optional<Subscriber> findByAthleteAndOpportunity(Athlete athlete, Opportunity opportunity);

  List<Subscriber> findByOpportunityId(Long opportunityId);
}
