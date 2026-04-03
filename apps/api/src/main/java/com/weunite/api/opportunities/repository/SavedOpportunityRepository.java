package com.weunite.api.opportunities.repository;

import com.weunite.api.opportunities.domain.SavedOpportunity;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SavedOpportunityRepository extends JpaRepository<SavedOpportunity, Long> {

  @Query(
      "SELECT s FROM SavedOpportunity s "
          + "WHERE s.athlete.id = :athleteId AND s.opportunity.id = :opportunityId")
  Optional<SavedOpportunity> findByAthleteIdAndOpportunityId(
      @Param("athleteId") Long athleteId, @Param("opportunityId") Long opportunityId);

  @Query(
      "SELECT s FROM SavedOpportunity s "
          + "WHERE s.athlete.id = :athleteId "
          + "ORDER BY s.savedAt DESC")
  List<SavedOpportunity> findByAthleteIdOrderBySavedAtDesc(@Param("athleteId") Long athleteId);

  @Query(
      "SELECT COUNT(s) > 0 FROM SavedOpportunity s "
          + "WHERE s.athlete.id = :athleteId AND s.opportunity.id = :opportunityId")
  boolean existsByAthleteIdAndOpportunityId(
      @Param("athleteId") Long athleteId, @Param("opportunityId") Long opportunityId);

  int deleteByAthleteId(Long athleteId);

  int deleteByOpportunityId(Long opportunityId);
}
