package com.example.weuniteauth.repository;

import com.example.weuniteauth.domain.report.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {

    @Query("SELECT r.entityId, r.type, COUNT(r) " +
           "FROM Report r " +
           "WHERE r.type = :type AND r.status = 'PENDING' " +
           "GROUP BY r.entityId, r.type " +
           "HAVING COUNT(r) >= :threshold " +
           "ORDER BY COUNT(r) DESC")
    List<Object[]> findEntitiesWithManyReports(@Param("type") Report.ReportType type, @Param("threshold") Long threshold);

    Long countByEntityIdAndTypeAndStatus(Long entityId, Report.ReportType type, Report.ReportStatus status);

    List<Report> findByEntityIdAndTypeAndStatus(Long entityId, Report.ReportType type, Report.ReportStatus status);

    @Query("SELECT r FROM Report r WHERE r.status = 'PENDING' ORDER BY r.createdAt DESC")
    List<Report> findAllPendingReports();
}

