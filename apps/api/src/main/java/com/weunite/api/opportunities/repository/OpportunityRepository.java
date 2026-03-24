package com.weunite.api.opportunities.repository;

import com.weunite.api.opportunities.domain.Opportunity;
import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OpportunityRepository extends JpaRepository<Opportunity, Long> {

  @Query("SELECT o FROM Opportunity o ORDER BY COALESCE(o.updatedAt, o.createdAt) DESC")
  List<Opportunity> findAllOrderedByCreationDate();

  List<Opportunity> findByCompanyId(Long userId);

  @Query("SELECT COUNT(o) FROM Opportunity o WHERE o.createdAt BETWEEN :startDate AND :endDate")
  Long countOpportunitiesBetweenDates(
      @Param("startDate") Instant startDate, @Param("endDate") Instant endDate);
}
