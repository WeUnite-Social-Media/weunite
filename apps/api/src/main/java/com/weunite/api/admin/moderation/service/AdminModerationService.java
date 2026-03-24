package com.weunite.api.admin.moderation.service;

import com.weunite.api.admin.moderation.dto.BanUserRequestDTO;
import com.weunite.api.admin.moderation.dto.SuspendUserRequestDTO;
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

/** Serviço responsável pela moderação de usuários. Lida com suspensões e banimentos de usuários. */
@Service
public class AdminModerationService {

  private final UserRepository userRepository;
  private final ReportRepository reportRepository;

  public AdminModerationService(UserRepository userRepository, ReportRepository reportRepository) {
    this.userRepository = userRepository;
    this.reportRepository = reportRepository;
  }

  /** Bane um usuário permanentemente. Fecha TODAS as denúncias relacionadas ao usuário. */
  @Transactional
  public ResponseDTO<String> banUser(BanUserRequestDTO request) {
    User user = userRepository.findById(request.userId()).orElseThrow(UserNotFoundException::new);

    // Marcar usuário como banido
    user.setBanned(true);
    user.setBannedAt(Instant.now());
    user.setBannedReason(request.reason());
    user.setBannedByAdminId(request.adminId());
    userRepository.save(user);

    // Resolver todas as denúncias pendentes do usuário
    List<Report> userReports = reportRepository.findPendingReportsByUser(user);
    Instant now = Instant.now();

    userReports.forEach(
        report -> {
          report.setStatus(Report.ReportStatus.RESOLVED);
          report.setActionTaken(Report.ActionTaken.USER_BANNED);
          report.setResolvedByAdminId(request.adminId());
          report.setResolvedAt(now);
        });

    reportRepository.saveAll(userReports);

    return new ResponseDTO<>(
        "Usuário banido com sucesso",
        String.format(
            "Usuário @%s foi banido permanentemente. %d denúncias foram resolvidas.",
            user.getUsername(), userReports.size()));
  }

  /** Suspende um usuário temporariamente. Fecha APENAS a denúncia específica (se fornecida). */
  @Transactional
  public ResponseDTO<String> suspendUser(SuspendUserRequestDTO request) {
    User user = userRepository.findById(request.userId()).orElseThrow(UserNotFoundException::new);

    // Marcar usuário como suspenso
    user.setSuspended(true);
    Instant suspendedUntil = Instant.now().plus(request.durationInDays(), ChronoUnit.DAYS);
    user.setSuspendedUntil(suspendedUntil);
    user.setSuspensionReason(request.reason());
    userRepository.save(user);

    // Resolver apenas a denúncia específica (se fornecida)
    if (request.reportId() != null) {
      Report report = reportRepository.findById(request.reportId()).orElse(null);

      if (report != null) {
        report.setStatus(Report.ReportStatus.RESOLVED);
        report.setActionTaken(Report.ActionTaken.USER_SUSPENDED);
        report.setResolvedByAdminId(request.adminId());
        report.setResolvedAt(Instant.now());
        reportRepository.save(report);
      }
    }

    return new ResponseDTO<>(
        "Usuário suspenso com sucesso",
        String.format(
            "Usuário @%s foi suspenso por %d dia(s).",
            user.getUsername(), request.durationInDays()));
  }
}
