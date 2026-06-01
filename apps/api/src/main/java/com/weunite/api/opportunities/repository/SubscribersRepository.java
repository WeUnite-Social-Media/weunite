package com.weunite.api.opportunities.repository;

import com.weunite.api.opportunities.domain.Opportunity;
import com.weunite.api.opportunities.domain.Subscriber;
import com.weunite.api.users.domain.Athlete;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubscribersRepository extends JpaRepository<Subscriber, Long> {

  Optional<Subscriber> findByAthleteAndOpportunity(Athlete athlete, Opportunity opportunity);

  List<Subscriber> findByOpportunityId(Long opportunityId);

  List<Subscriber> findByAthleteIdAndOpportunityDeletedFalse(Long athleteId);

  int deleteByOpportunityId(Long opportunityId);

  @EntityGraph(
      attributePaths = {
        "athlete",
        "athlete.role",
        "athlete.skills",
        "opportunity",
        "opportunity.company",
        "opportunity.company.role",
        "opportunity.skills",
        "opportunity.subscribers"
      })
  List<Subscriber> findReadModelsByOpportunityId(Long opportunityId);

  @EntityGraph(
      attributePaths = {
        "athlete",
        "athlete.role",
        "athlete.skills",
        "opportunity",
        "opportunity.company",
        "opportunity.company.role",
        "opportunity.skills",
        "opportunity.subscribers"
      })
  Page<Subscriber> findReadModelsByOpportunityId(Long opportunityId, Pageable pageable);

  @EntityGraph(
      attributePaths = {
        "athlete",
        "athlete.role",
        "athlete.skills",
        "opportunity",
        "opportunity.company",
        "opportunity.company.role",
        "opportunity.skills",
        "opportunity.subscribers"
      })
  List<Subscriber> findReadModelsByAthleteIdAndOpportunityDeletedFalse(Long athleteId);

  @EntityGraph(
      attributePaths = {
        "athlete",
        "athlete.role",
        "athlete.skills",
        "opportunity",
        "opportunity.company",
        "opportunity.company.role",
        "opportunity.skills",
        "opportunity.subscribers"
      })
  Page<Subscriber> findReadModelsByAthleteIdAndOpportunityDeletedFalse(
      Long athleteId, Pageable pageable);
}
