package com.weunite.api.reports.domain;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.weunite.api.reports.repository.ReportRepository;
import com.weunite.api.users.domain.User;
import com.weunite.api.users.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.TestPropertySource;

@DataJpaTest
@TestPropertySource(properties = "spring.jpa.hibernate.ddl-auto=create-drop")
class ReportTargetPersistenceTest {

  @Autowired private ReportRepository reportRepository;

  @Autowired private UserRepository userRepository;

  @Test
  @DisplayName("Should persist and query reports through typed targets")
  void persistReportTarget() {
    User reporter =
        userRepository.saveAndFlush(
            new User("Target Reporter", "target_reporter", "target@example.com", "encoded"));
    Report report =
        reportRepository.saveAndFlush(
            new Report(reporter, Report.ReportType.POST, 42L, "Reported content"));

    assertEquals(Report.ReportType.POST, report.getTarget().getType());
    assertEquals(42L, report.getTarget().getEntityId());
    assertEquals(Report.ReportType.POST, report.getType());
    assertEquals(42L, report.getEntityId());
    assertEquals(
        1L,
        reportRepository.countByTargetAndStatus(
            new ReportTarget(Report.ReportType.POST, 42L), Report.ReportStatus.PENDING));
    assertEquals(
        report.getId(),
        reportRepository
            .findByTarget(new ReportTarget(Report.ReportType.POST, 42L))
            .get(0)
            .getId());
  }
}
