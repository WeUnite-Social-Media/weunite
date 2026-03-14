package com.weunite.api.opportunities.repository;

import com.weunite.api.opportunities.domain.Opportunity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface OpportunityRepository extends JpaRepository<Opportunity, Long> {

  @Query("SELECT o FROM Opportunity o ORDER BY COALESCE(o.updatedAt, o.createdAt) DESC")
  List<Opportunity> findAllOrderedByCreationDate();

  List<Opportunity> findByCompanyId(Long userId);
}
