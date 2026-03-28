package com.weunite.api.admin.moderation.service;

import com.weunite.api.admin.moderation.dto.BanUserRequestDTO;
import com.weunite.api.admin.moderation.dto.SuspendUserRequestDTO;
import com.weunite.api.common.exception.NotFoundResourceException;
import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.reports.domain.Report;
import com.weunite.api.reports.repository.ReportRepository;
import com.weunite.api.users.domain.User;
import com.weunite.api.users.exception.UserNotFoundException;
import com.weunite.api.users.repository.UserRepository;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Servico responsavel pela moderacao de usuarios. Lida com suspensoes e banimentos de usuarios. */
@Service
public class AdminModerationService {

  private final UserRepository userRepository;
  private final ReportRepository reportRepository;

  public AdminModerationService(UserRepository userRepository, ReportRepository reportRepository) {
    this.userRepository = userRepository;
    this.reportRepository = reportRepository;
  }

  /** Bane um usuario permanentemente. Fecha TODAS as denuncias relacionadas ao usuario. */
  @Transactional
  public ResponseDTO<String> banUser(BanUserRequestDTO request) {
    User user = userRepository.findById(request.userId()).orElseThrow(UserNotFoundException::new);
    Instant now = Instant.now();

    // Marcar usuario como banido
    user.setBanned(true);
    user.setBannedAt(now);
    user.setBannedReason(request.reason());
    user.setBannedByAdminId(request.adminId());
    userRepository.save(user);

    // Resolver todas as denuncias pendentes do usuario
    List<Report> userReports = reportRepository.findPendingReportsByUser(user);
    userReports.forEach(
        report -> {
          report.setStatus(Report.ReportStatus.RESOLVED);
          report.setActionTaken(Report.ActionTaken.USER_BANNED);
          report.setResolvedByAdminId(request.adminId());
          report.setResolvedAt(now);
        });

    reportRepository.saveAll(userReports);

    return new ResponseDTO<>(
        "Usuario banido com sucesso",
        String.format(
            "Usuario @%s foi banido permanentemente. %d denuncias foram resolvidas.",
            user.getUsername(), userReports.size()));
  }

  /** Suspende um usuario temporariamente. Fecha APENAS a denuncia especifica (se fornecida). */
  @Transactional
  public ResponseDTO<String> suspendUser(SuspendUserRequestDTO request) {
    User user = userRepository.findById(request.userId()).orElseThrow(UserNotFoundException::new);
    Instant now = Instant.now();

    // Marcar usuario como suspenso
    user.setSuspended(true);
    Instant suspendedUntil = now.plus(request.durationInDays(), ChronoUnit.DAYS);
    user.setSuspendedUntil(suspendedUntil);
    user.setSuspensionReason(request.reason());
    userRepository.save(user);

    // Resolver apenas a denuncia especifica (se fornecida)
    if (request.reportId() != null) {
      Report report =
          reportRepository
              .findById(request.reportId())
              .orElseThrow(() -> new NotFoundResourceException("Report"));
      report.setStatus(Report.ReportStatus.RESOLVED);
      report.setActionTaken(Report.ActionTaken.USER_SUSPENDED);
      report.setResolvedByAdminId(request.adminId());
      report.setResolvedAt(now);
      reportRepository.save(report);
    }

    return new ResponseDTO<>(
        "Usuario suspenso com sucesso",
        String.format(
            "Usuario @%s foi suspenso por %d dia(s).",
            user.getUsername(), request.durationInDays()));
  }
}
