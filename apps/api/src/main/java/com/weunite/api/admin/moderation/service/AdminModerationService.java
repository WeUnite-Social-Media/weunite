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

/**
 * ServiÃ§o responsÃ¡vel pela moderaÃ§Ã£o de usuÃ¡rios. Lida com suspensÃµes e banimentos de
 * usuÃ¡rios.
 */
@Service
public class AdminModerationService {

  private final UserRepository userRepository;
  private final ReportRepository reportRepository;

  public AdminModerationService(UserRepository userRepository, ReportRepository reportRepository) {
    this.userRepository = userRepository;
    this.reportRepository = reportRepository;
  }

  /** Bane um usuÃ¡rio permanentemente. Fecha TODAS as denÃºncias relacionadas ao usuÃ¡rio. */
  @Transactional
  public ResponseDTO<String> banUser(BanUserRequestDTO request) {
    User user = userRepository.findById(request.userId()).orElseThrow(UserNotFoundException::new);
    Instant now = Instant.now();

    // Marcar usuÃ¡rio como banido
    user.setBanned(true);
    user.setBannedAt(now);
    user.setBannedReason(request.reason());
    user.setBannedByAdminId(request.adminId());
    userRepository.save(user);

    // Resolver todas as denÃºncias pendentes do usuÃ¡rio
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
        "UsuÃ¡rio banido com sucesso",
        String.format(
            "UsuÃ¡rio @%s foi banido permanentemente. %d denÃºncias foram resolvidas.",
            user.getUsername(), userReports.size()));
  }

  /** Suspende um usuÃ¡rio temporariamente. Fecha APENAS a denÃºncia especÃ­fica (se fornecida). */
  @Transactional
  public ResponseDTO<String> suspendUser(SuspendUserRequestDTO request) {
    User user = userRepository.findById(request.userId()).orElseThrow(UserNotFoundException::new);
    Instant now = Instant.now();

    // Marcar usuÃ¡rio como suspenso
    user.setSuspended(true);
    Instant suspendedUntil = now.plus(request.durationInDays(), ChronoUnit.DAYS);
    user.setSuspendedUntil(suspendedUntil);
    user.setSuspensionReason(request.reason());
    userRepository.save(user);

    // Resolver apenas a denÃºncia especÃ­fica (se fornecida)
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
        "UsuÃ¡rio suspenso com sucesso",
        String.format(
            "UsuÃ¡rio @%s foi suspenso por %d dia(s).",
            user.getUsername(), request.durationInDays()));
  }
}
