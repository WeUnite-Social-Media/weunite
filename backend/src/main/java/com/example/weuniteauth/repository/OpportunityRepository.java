package com.example.weuniteauth.repository;


import com.example.weuniteauth.domain.opportunity.Opportunity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OpportunityRepository extends JpaRepository<Opportunity, Long> {

    @Query("SELECT o FROM Opportunity o ORDER BY COALESCE(o.updatedAt, o.createdAt) DESC")
    List<Opportunity> findAllOrderedByCreationDate();

    List<Opportunity> findByCompanyId(Long userId);
}
