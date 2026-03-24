package com.weunite.api.reports.repository;

import com.weunite.api.reports.domain.Report;
import com.weunite.api.users.domain.User;
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
          + "WHERE r.reporter = :user AND r.status = 'PENDING' "
          + "ORDER BY r.createdAt DESC")
  List<Report> findPendingReportsByUser(@Param("user") User user);

  @Query("SELECT r FROM Report r WHERE r.status = 'PENDING' ORDER BY r.createdAt DESC")
  List<Report> findAllPendingReports();
}
