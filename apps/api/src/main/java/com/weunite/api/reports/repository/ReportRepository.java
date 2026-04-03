package com.weunite.api.reports.repository;

import com.weunite.api.reports.domain.Report;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReportRepository extends JpaRepository<Report, Long> {

  @Query(
      "SELECT r.entityId, r.type, COUNT(r) "
          + "FROM Report r "
          + "WHERE r.type = :type AND r.status = 'PENDING' "
          + "GROUP BY r.entityId, r.type "
          + "HAVING COUNT(r) >= :threshold "
          + "ORDER BY COUNT(r) DESC")
  List<Object[]> findEntitiesWithManyReports(
      @Param("type") Report.ReportType type, @Param("threshold") Long threshold);

  Long countByEntityIdAndTypeAndStatus(
      Long entityId, Report.ReportType type, Report.ReportStatus status);

  List<Report> findByEntityIdAndTypeAndStatus(
      Long entityId, Report.ReportType type, Report.ReportStatus status);

  List<Report> findByEntityIdAndType(Long entityId, Report.ReportType type);

  List<Report> findByEntityIdInAndType(List<Long> entityIds, Report.ReportType type);

  @Query(
      "SELECT r.entityId, r.type, COUNT(r) "
          + "FROM Report r "
          + "WHERE r.type = :type "
          + "GROUP BY r.entityId, r.type "
          + "HAVING COUNT(r) >= :threshold "
          + "ORDER BY COUNT(r) DESC")
  List<Object[]> findAllEntitiesWithReports(
      @Param("type") Report.ReportType type, @Param("threshold") Long threshold);

  @Query(
      "SELECT r FROM Report r "
          + "WHERE r.status IN :statuses AND ("
          + "(r.type = :postType AND r.entityId IN ("
          + "SELECT p.id FROM Post p WHERE p.user.id = :userId"
          + ")) OR (r.type = :commentType AND r.entityId IN ("
          + "SELECT c.id FROM Comment c WHERE c.user.id = :userId"
          + ")) OR (r.type = :opportunityType AND r.entityId IN ("
          + "SELECT o.id FROM Opportunity o WHERE o.company.id = :userId"
          + "))) "
          + "ORDER BY r.createdAt DESC")
  List<Report> findOpenContentReportsByUserId(
      @Param("userId") Long userId,
      @Param("statuses") List<Report.ReportStatus> statuses,
      @Param("postType") Report.ReportType postType,
      @Param("commentType") Report.ReportType commentType,
      @Param("opportunityType") Report.ReportType opportunityType);

  @Query("SELECT r FROM Report r WHERE r.status = 'PENDING' ORDER BY r.createdAt DESC")
  List<Report> findAllPendingReports();

  @Query("SELECT r FROM Report r ORDER BY r.createdAt DESC")
  List<Report> findAllReports();

  @Query("SELECT r FROM Report r WHERE r.status = :status ORDER BY r.createdAt DESC")
  List<Report> findAllReportsByStatus(@Param("status") Report.ReportStatus status);

  @Query(
      "SELECT COUNT(r) FROM Report r "
          + "WHERE r.status = :status AND ("
          + "(r.type = :postType AND r.entityId IN ("
          + "SELECT p.id FROM Post p WHERE p.user.id = :userId AND p.deleted = false"
          + ")) OR (r.type = :commentType AND r.entityId IN ("
          + "SELECT c.id FROM Comment c WHERE c.user.id = :userId AND c.deleted = false"
          + ")) OR (r.type = :opportunityType AND r.entityId IN ("
          + "SELECT o.id FROM Opportunity o WHERE o.company.id = :userId AND o.deleted = false"
          + ")))")
  Long countPendingContentReportsByUserId(
      @Param("userId") Long userId,
      @Param("status") Report.ReportStatus status,
      @Param("postType") Report.ReportType postType,
      @Param("commentType") Report.ReportType commentType,
      @Param("opportunityType") Report.ReportType opportunityType);
}
