package com.weunite.api.opportunities.repository;

import com.weunite.api.opportunities.domain.Opportunity;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OpportunityRepository extends JpaRepository<Opportunity, Long> {

  @Query(
      "SELECT o FROM Opportunity o WHERE o.deleted = false ORDER BY COALESCE(o.updatedAt, o.createdAt) DESC")
  List<Opportunity> findAllActiveOrderedByCreationDate();

  @Query(
      "SELECT o FROM Opportunity o WHERE o.company.id = :companyId AND o.deleted = false ORDER BY COALESCE(o.updatedAt, o.createdAt) DESC")
  List<Opportunity> findActiveByCompanyId(@Param("companyId") Long companyId);

  Optional<Opportunity> findByIdAndDeletedFalse(Long opportunityId);

  boolean existsByIdAndCompanyId(Long opportunityId, Long companyId);

  Long countByCompanyIdAndDeletedFalse(Long companyId);

  @Query(
      "SELECT o.company.id, COUNT(o) FROM Opportunity o "
          + "WHERE o.deleted = false AND o.company.id IN :companyIds "
          + "GROUP BY o.company.id")
  List<Object[]> countActiveOpportunitiesByCompanyIds(@Param("companyIds") List<Long> companyIds);

  @Query(
      "SELECT COUNT(o) FROM Opportunity o WHERE o.createdAt >= :startDate AND o.createdAt < :endDate")
  Long countOpportunitiesBetweenDates(
      @Param("startDate") Instant startDate, @Param("endDate") Instant endDate);

  @Query(
      value =
          """
          SELECT s.name AS skillName, COUNT(DISTINCT os.opportunity_id) AS opportunityCount
          FROM opportunity_skills os
          JOIN skill s ON s.id = os.skills_id
          JOIN opportunity o ON o.id = os.opportunity_id
          WHERE o.deleted = false
            AND s.name IS NOT NULL
            AND TRIM(s.name) <> ''
          GROUP BY s.name
          ORDER BY opportunityCount DESC, skillName ASC
          """,
      nativeQuery = true)
  List<OpportunitySkillCountProjection> findOpportunitySkillCounts();

  @Query(
      value =
          """
          SELECT
            s1.name AS skillName,
            s2.name AS relatedSkillName,
            COUNT(DISTINCT os1.opportunity_id) AS opportunityCount
          FROM opportunity_skills os1
          JOIN opportunity_skills os2
            ON os1.opportunity_id = os2.opportunity_id
           AND os1.skills_id <> os2.skills_id
          JOIN skill s1 ON s1.id = os1.skills_id
          JOIN skill s2 ON s2.id = os2.skills_id
          JOIN opportunity o ON o.id = os1.opportunity_id
          WHERE o.deleted = false
            AND s1.name IS NOT NULL
            AND TRIM(s1.name) <> ''
            AND s2.name IS NOT NULL
            AND TRIM(s2.name) <> ''
          GROUP BY s1.name, s2.name
          ORDER BY skillName ASC, opportunityCount DESC, relatedSkillName ASC
          """,
      nativeQuery = true)
  List<OpportunitySkillPairProjection> findOpportunitySkillPairCounts();
}
