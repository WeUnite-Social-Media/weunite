package com.weunite.api.reports.repository;

import com.weunite.api.reports.domain.Report;
import com.weunite.api.reports.domain.ReportTarget;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReportRepository extends JpaRepository<Report, Long> {

  @Query(
      "SELECT r.target.entityId, r.target.type, COUNT(r) "
          + "FROM Report r "
          + "WHERE r.target.type = :type AND r.status = 'PENDING' "
          + "GROUP BY r.target.entityId, r.target.type "
          + "HAVING COUNT(r) >= :threshold "
          + "ORDER BY COUNT(r) DESC")
  List<Object[]> findEntitiesWithManyReports(
      @Param("type") Report.ReportType type, @Param("threshold") Long threshold);

  @Query("SELECT COUNT(r) FROM Report r WHERE r.target = :target AND r.status = :status")
  Long countByTargetAndStatus(
      @Param("target") ReportTarget target, @Param("status") Report.ReportStatus status);

  @Query("SELECT r FROM Report r WHERE r.target = :target AND r.status = :status")
  List<Report> findByTargetAndStatus(
      @Param("target") ReportTarget target, @Param("status") Report.ReportStatus status);

  @Query("SELECT r FROM Report r WHERE r.target = :target AND r.status IN :statuses")
  List<Report> findByTargetAndStatusIn(
      @Param("target") ReportTarget target, @Param("statuses") List<Report.ReportStatus> statuses);

  @Query("SELECT r FROM Report r WHERE r.target = :target")
  List<Report> findByTarget(@Param("target") ReportTarget target);

  @Query(
      "SELECT r FROM Report r " + "WHERE r.target.entityId IN :entityIds AND r.target.type = :type")
  List<Report> findByEntityIdInAndType(
      @Param("entityIds") List<Long> entityIds, @Param("type") Report.ReportType type);

  @Query(
      "SELECT r.target.entityId, r.target.type, COUNT(r) "
          + "FROM Report r "
          + "WHERE r.target.type = :type "
          + "GROUP BY r.target.entityId, r.target.type "
          + "HAVING COUNT(r) >= :threshold "
          + "ORDER BY COUNT(r) DESC")
  List<Object[]> findAllEntitiesWithReports(
      @Param("type") Report.ReportType type, @Param("threshold") Long threshold);

  @Query(
      "SELECT r FROM Report r "
          + "WHERE r.status IN :statuses AND ("
          + "(r.target.type = :postType AND r.target.entityId IN ("
          + "SELECT p.id FROM Post p WHERE p.user.id = :userId"
          + ")) OR (r.target.type = :commentType AND r.target.entityId IN ("
          + "SELECT c.id FROM Comment c WHERE c.user.id = :userId"
          + ")) OR (r.target.type = :opportunityType AND r.target.entityId IN ("
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
          + "(r.target.type = :postType AND r.target.entityId IN ("
          + "SELECT p.id FROM Post p WHERE p.user.id = :userId AND p.deleted = false"
          + ")) OR (r.target.type = :commentType AND r.target.entityId IN ("
          + "SELECT c.id FROM Comment c WHERE c.user.id = :userId AND c.deleted = false"
          + ")) OR (r.target.type = :opportunityType AND r.target.entityId IN ("
          + "SELECT o.id FROM Opportunity o WHERE o.company.id = :userId AND o.deleted = false"
          + ")))")
  Long countPendingContentReportsByUserId(
      @Param("userId") Long userId,
      @Param("status") Report.ReportStatus status,
      @Param("postType") Report.ReportType postType,
      @Param("commentType") Report.ReportType commentType,
      @Param("opportunityType") Report.ReportType opportunityType);

  @Query(
      "SELECT p.user.id, COUNT(r) FROM Report r, Post p "
          + "WHERE r.status = :status AND r.target.type = :type "
          + "AND r.target.entityId = p.id AND p.deleted = false AND p.user.id IN :userIds "
          + "GROUP BY p.user.id")
  List<Object[]> countPendingPostReportsByUserIds(
      @Param("userIds") List<Long> userIds,
      @Param("status") Report.ReportStatus status,
      @Param("type") Report.ReportType type);

  @Query(
      "SELECT c.user.id, COUNT(r) FROM Report r, Comment c "
          + "WHERE r.status = :status AND r.target.type = :type "
          + "AND r.target.entityId = c.id AND c.deleted = false AND c.user.id IN :userIds "
          + "GROUP BY c.user.id")
  List<Object[]> countPendingCommentReportsByUserIds(
      @Param("userIds") List<Long> userIds,
      @Param("status") Report.ReportStatus status,
      @Param("type") Report.ReportType type);

  @Query(
      "SELECT o.company.id, COUNT(r) FROM Report r, Opportunity o "
          + "WHERE r.status = :status AND r.target.type = :type "
          + "AND r.target.entityId = o.id AND o.deleted = false AND o.company.id IN :userIds "
          + "GROUP BY o.company.id")
  List<Object[]> countPendingOpportunityReportsByUserIds(
      @Param("userIds") List<Long> userIds,
      @Param("status") Report.ReportStatus status,
      @Param("type") Report.ReportType type);
}
