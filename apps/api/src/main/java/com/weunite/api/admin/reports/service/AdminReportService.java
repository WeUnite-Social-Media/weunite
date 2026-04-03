package com.weunite.api.admin.reports.service;

import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.opportunities.domain.Opportunity;
import com.weunite.api.opportunities.dto.OpportunityDTO;
import com.weunite.api.opportunities.exception.OpportunityNotFoundException;
import com.weunite.api.opportunities.mapper.OpportunityMapper;
import com.weunite.api.opportunities.repository.OpportunityRepository;
import com.weunite.api.posts.domain.Comment;
import com.weunite.api.posts.domain.Post;
import com.weunite.api.posts.dto.CommentDTO;
import com.weunite.api.posts.dto.PostDTO;
import com.weunite.api.posts.exception.CommentNotFoundException;
import com.weunite.api.posts.exception.PostNotFoundException;
import com.weunite.api.posts.mapper.CommentMapper;
import com.weunite.api.posts.mapper.PostMapper;
import com.weunite.api.posts.repository.CommentRepository;
import com.weunite.api.posts.repository.PostRepository;
import com.weunite.api.reports.domain.Report;
import com.weunite.api.reports.dto.ReportDTO;
import com.weunite.api.reports.dto.ReportSummaryDTO;
import com.weunite.api.reports.dto.ReportedCommentDetailDTO;
import com.weunite.api.reports.dto.ReportedOpportunityDetailDTO;
import com.weunite.api.reports.dto.ReportedPostDetailDTO;
import com.weunite.api.reports.mapper.ReportMapper;
import com.weunite.api.reports.repository.ReportRepository;
import com.weunite.api.users.dto.UserDTO;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Servico responsavel pelo gerenciamento de reports/denuncias no painel admin. Lida com
 * visualizacao, analise e acoes sobre reports de posts e oportunidades.
 */
@Service
public class AdminReportService {

  private final ReportRepository reportRepository;
  private final PostRepository postRepository;
  private final OpportunityRepository opportunityRepository;
  private final CommentRepository commentRepository;
  private final PostMapper postMapper;
  private final OpportunityMapper opportunityMapper;
  private final CommentMapper commentMapper;
  private final ReportMapper reportMapper;

  private static final Long REPORT_THRESHOLD = 1L;

  public AdminReportService(
      ReportRepository reportRepository,
      PostRepository postRepository,
      OpportunityRepository opportunityRepository,
      CommentRepository commentRepository,
      PostMapper postMapper,
      OpportunityMapper opportunityMapper,
      CommentMapper commentMapper,
      ReportMapper reportMapper) {
    this.reportRepository = reportRepository;
    this.postRepository = postRepository;
    this.opportunityRepository = opportunityRepository;
    this.commentRepository = commentRepository;
    this.postMapper = postMapper;
    this.opportunityMapper = opportunityMapper;
    this.commentMapper = commentMapper;
    this.reportMapper = reportMapper;
  }

  // ========== Posts Reportados ==========

  @Transactional(readOnly = true)
  public List<ReportSummaryDTO> getPostsWithManyReports() {
    List<Object[]> results =
        reportRepository.findEntitiesWithManyReports(Report.ReportType.POST, REPORT_THRESHOLD);

    return results.stream()
        .map(
            result ->
                new ReportSummaryDTO(
                    (Long) result[0], ((Report.ReportType) result[1]).name(), (Long) result[2]))
        .collect(Collectors.toList());
  }

  @Transactional(readOnly = true)
  public List<ReportedPostDetailDTO> getReportedPostsDetails() {
    List<Object[]> results =
        reportRepository.findAllEntitiesWithReports(Report.ReportType.POST, REPORT_THRESHOLD);
    List<Long> postIds = extractEntityIds(results);
    Map<Long, Post> postsById = indexById(postRepository.findAllById(postIds), Post::getId);
    Map<Long, List<Report>> reportsByPostId =
        groupReportsByEntityId(postIds, Report.ReportType.POST);
    Instant placeholderTimestamp = Instant.now();

    return results.stream()
        .map(
            result -> {
              Long postId = (Long) result[0];
              Post post = postsById.get(postId);
              List<Report> allReports = reportsByPostId.getOrDefault(postId, List.of());

              PostDTO postDTO;
              if (post != null) {
                postDTO = postMapper.toPostDTO(post);
              } else {
                // Cria um DTO placeholder para post deletado permanentemente
                postDTO =
                    new PostDTO(
                        String.valueOf(postId),
                        "Conteudo removido permanentemente",
                        null,
                        null,
                        List.of(),
                        List.of(),
                        placeholderTimestamp,
                        placeholderTimestamp,
                        new UserDTO(
                            "0",
                            "Usuario Desconhecido",
                            "unknown",
                            "USER",
                            "",
                            "",
                            "",
                            "",
                            false,
                            placeholderTimestamp,
                            placeholderTimestamp),
                        null,
                        null);
              }

              List<ReportDTO> reportDTOs = reportMapper.toReportDTOList(allReports);
              String status =
                  resolveReportedEntityStatus(post == null || post.isDeleted(), allReports);

              return new ReportedPostDetailDTO(
                  postDTO, reportDTOs, (long) allReports.size(), status);
            })
        .collect(Collectors.toList());
  }

  @Transactional(readOnly = true)
  public ReportedPostDetailDTO getReportedPostDetail(Long postId) {
    Post post = postRepository.findById(postId).orElseThrow(PostNotFoundException::new);

    List<Report> reports =
        reportRepository.findByEntityIdAndTypeAndStatus(
            postId, Report.ReportType.POST, Report.ReportStatus.PENDING);

    PostDTO postDTO = postMapper.toPostDTO(post);
    List<ReportDTO> reportDTOs = reportMapper.toReportDTOList(reports);

    return new ReportedPostDetailDTO(
        postDTO, reportDTOs, (long) reports.size(), reports.isEmpty() ? "resolved" : "pending");
  }

  @Transactional
  public ResponseDTO<PostDTO> deletePostByAdmin(Long postId) {
    Post post = postRepository.findById(postId).orElseThrow(PostNotFoundException::new);

    // Marcar todas as denuncias relacionadas como RESOLVED (pois o conteudo foi removido)
    List<Report> reports = reportRepository.findByEntityIdAndType(postId, Report.ReportType.POST);
    reports.forEach(
        report -> {
          report.setStatus(Report.ReportStatus.RESOLVED);
          report.setActionTaken(Report.ActionTaken.CONTENT_REMOVED);
        });
    reportRepository.saveAll(reports);

    post.setDeleted(true);
    postRepository.save(post);

    return postMapper.toResponseDTO("Post excluido com sucesso pelo administrador", post);
  }

  @Transactional
  public ResponseDTO<PostDTO> restorePostByAdmin(Long postId) {
    Post post = postRepository.findById(postId).orElseThrow(PostNotFoundException::new);
    Instant now = Instant.now();

    post.setDeleted(false);
    postRepository.save(post);

    // Atualizar status dos reports relacionados para RESOLVED
    List<Report> reports = reportRepository.findByEntityIdAndType(postId, Report.ReportType.POST);
    reports.forEach(
        report -> {
          report.setStatus(Report.ReportStatus.RESOLVED);
          report.setActionTaken(Report.ActionTaken.NONE);
          report.setResolvedAt(now);
        });
    reportRepository.saveAll(reports);

    return postMapper.toResponseDTO("Post restaurado com sucesso pelo administrador", post);
  }

  // ========== Oportunidades Reportadas ==========

  @Transactional(readOnly = true)
  public List<ReportSummaryDTO> getOpportunitiesWithManyReports() {
    List<Object[]> results =
        reportRepository.findEntitiesWithManyReports(
            Report.ReportType.OPPORTUNITY, REPORT_THRESHOLD);

    return results.stream()
        .map(
            result ->
                new ReportSummaryDTO(
                    (Long) result[0], ((Report.ReportType) result[1]).name(), (Long) result[2]))
        .collect(Collectors.toList());
  }

  @Transactional(readOnly = true)
  public List<ReportedOpportunityDetailDTO> getReportedOpportunitiesDetails() {
    List<Object[]> results =
        reportRepository.findAllEntitiesWithReports(
            Report.ReportType.OPPORTUNITY, REPORT_THRESHOLD);
    List<Long> opportunityIds = extractEntityIds(results);
    Map<Long, Opportunity> opportunitiesById =
        indexById(opportunityRepository.findAllById(opportunityIds), Opportunity::getId);
    Map<Long, List<Report>> reportsByOpportunityId =
        groupReportsByEntityId(opportunityIds, Report.ReportType.OPPORTUNITY);
    Instant placeholderTimestamp = Instant.now();

    return results.stream()
        .map(
            result -> {
              Long opportunityId = (Long) result[0];
              Opportunity opportunity = opportunitiesById.get(opportunityId);
              List<Report> allReports =
                  reportsByOpportunityId.getOrDefault(opportunityId, List.of());

              OpportunityDTO opportunityDTO;
              if (opportunity != null) {
                opportunityDTO = opportunityMapper.toOpportunityDTO(opportunity);
              } else {
                // Cria um DTO placeholder para oportunidade deletada permanentemente
                opportunityDTO =
                    new OpportunityDTO(
                        opportunityId,
                        "Oportunidade removida permanentemente",
                        "Conteudo indisponivel",
                        "Localizacao indisponivel",
                        null,
                        Set.of(),
                        placeholderTimestamp,
                        placeholderTimestamp,
                        new UserDTO(
                            "0",
                            "Empresa Desconhecida",
                            "unknown",
                            "COMPANY",
                            "",
                            "",
                            "",
                            "",
                            false,
                            placeholderTimestamp,
                            placeholderTimestamp),
                        0);
              }

              List<ReportDTO> reportDTOs = reportMapper.toReportDTOList(allReports);
              String status =
                  resolveReportedEntityStatus(
                      opportunity == null || opportunity.isDeleted(), allReports);

              return new ReportedOpportunityDetailDTO(
                  opportunityDTO, reportDTOs, (long) allReports.size(), status);
            })
        .collect(Collectors.toList());
  }

  @Transactional(readOnly = true)
  public ReportedOpportunityDetailDTO getReportedOpportunityDetail(Long opportunityId) {
    Opportunity opportunity =
        opportunityRepository
            .findById(opportunityId)
            .orElseThrow(OpportunityNotFoundException::new);

    List<Report> reports =
        reportRepository.findByEntityIdAndTypeAndStatus(
            opportunityId, Report.ReportType.OPPORTUNITY, Report.ReportStatus.PENDING);

    OpportunityDTO opportunityDTO = opportunityMapper.toOpportunityDTO(opportunity);
    List<ReportDTO> reportDTOs = reportMapper.toReportDTOList(reports);

    return new ReportedOpportunityDetailDTO(
        opportunityDTO,
        reportDTOs,
        (long) reports.size(),
        reports.isEmpty() ? "resolved" : "pending");
  }

  @Transactional
  public ResponseDTO<OpportunityDTO> deleteOpportunityByAdmin(Long opportunityId) {
    Opportunity opportunity =
        opportunityRepository
            .findById(opportunityId)
            .orElseThrow(OpportunityNotFoundException::new);

    // Marcar todas as denuncias relacionadas como RESOLVED (pois o conteudo foi removido)
    List<Report> reports =
        reportRepository.findByEntityIdAndType(opportunityId, Report.ReportType.OPPORTUNITY);
    reports.forEach(
        report -> {
          report.setStatus(Report.ReportStatus.RESOLVED);
          report.setActionTaken(Report.ActionTaken.CONTENT_REMOVED);
        });
    reportRepository.saveAll(reports);

    opportunity.setDeleted(true);
    opportunityRepository.save(opportunity);

    return opportunityMapper.toResponseDTO(
        "Oportunidade excluida com sucesso pelo administrador", opportunity);
  }

  @Transactional
  public ResponseDTO<OpportunityDTO> restoreOpportunityByAdmin(Long opportunityId) {
    Opportunity opportunity =
        opportunityRepository
            .findById(opportunityId)
            .orElseThrow(OpportunityNotFoundException::new);
    Instant now = Instant.now();

    opportunity.setDeleted(false);
    opportunityRepository.save(opportunity);

    // Atualizar status dos reports relacionados para RESOLVED
    List<Report> reports =
        reportRepository.findByEntityIdAndType(opportunityId, Report.ReportType.OPPORTUNITY);
    reports.forEach(
        report -> {
          report.setStatus(Report.ReportStatus.RESOLVED);
          report.setActionTaken(Report.ActionTaken.NONE);
          report.setResolvedAt(now);
        });
    reportRepository.saveAll(reports);

    return opportunityMapper.toResponseDTO(
        "Oportunidade restaurada com sucesso pelo administrador", opportunity);
  }

  // ========== Comentarios Reportados ==========

  @Transactional(readOnly = true)
  public List<ReportSummaryDTO> getCommentsWithManyReports() {
    List<Object[]> results =
        reportRepository.findEntitiesWithManyReports(Report.ReportType.COMMENT, REPORT_THRESHOLD);

    return results.stream()
        .map(
            result ->
                new ReportSummaryDTO(
                    (Long) result[0], ((Report.ReportType) result[1]).name(), (Long) result[2]))
        .collect(Collectors.toList());
  }

  @Transactional(readOnly = true)
  public List<ReportedCommentDetailDTO> getReportedCommentsDetails() {
    List<Object[]> results =
        reportRepository.findAllEntitiesWithReports(Report.ReportType.COMMENT, REPORT_THRESHOLD);
    List<Long> commentIds = extractEntityIds(results);
    Map<Long, Comment> commentsById =
        indexById(commentRepository.findAllById(commentIds), Comment::getId);
    Map<Long, List<Report>> reportsByCommentId =
        groupReportsByEntityId(commentIds, Report.ReportType.COMMENT);
    Instant placeholderTimestamp = Instant.now();

    return results.stream()
        .map(
            result -> {
              Long commentId = (Long) result[0];
              Comment comment = commentsById.get(commentId);
              List<Report> allReports = reportsByCommentId.getOrDefault(commentId, List.of());

              CommentDTO commentDTO;
              if (comment != null) {
                commentDTO = commentMapper.toCommentDTO(comment);
              } else {
                // Cria um DTO placeholder para comentario deletado permanentemente
                commentDTO =
                    new CommentDTO(
                        String.valueOf(commentId),
                        new UserDTO(
                            "0",
                            "Usuario Desconhecido",
                            "unknown",
                            "USER",
                            "",
                            "",
                            "",
                            "",
                            false,
                            placeholderTimestamp,
                            placeholderTimestamp),
                        null,
                        "Comentario removido permanentemente",
                        null,
                        null,
                        List.of(),
                        placeholderTimestamp,
                        placeholderTimestamp);
              }

              List<ReportDTO> reportDTOs = reportMapper.toReportDTOList(allReports);
              String status =
                  resolveReportedEntityStatus(comment == null || comment.isDeleted(), allReports);

              return new ReportedCommentDetailDTO(
                  commentDTO, reportDTOs, (long) allReports.size(), status);
            })
        .collect(Collectors.toList());
  }

  @Transactional(readOnly = true)
  public ReportedCommentDetailDTO getReportedCommentDetail(Long commentId) {
    Comment comment =
        commentRepository.findById(commentId).orElseThrow(CommentNotFoundException::new);

    List<Report> reports =
        reportRepository.findByEntityIdAndTypeAndStatus(
            commentId, Report.ReportType.COMMENT, Report.ReportStatus.PENDING);

    CommentDTO commentDTO = commentMapper.toCommentDTO(comment);
    List<ReportDTO> reportDTOs = reportMapper.toReportDTOList(reports);

    return new ReportedCommentDetailDTO(
        commentDTO, reportDTOs, (long) reports.size(), reports.isEmpty() ? "resolved" : "pending");
  }

  @Transactional
  public ResponseDTO<CommentDTO> deleteCommentByAdmin(Long commentId) {
    Comment comment =
        commentRepository.findById(commentId).orElseThrow(CommentNotFoundException::new);

    // Marcar todas as denuncias relacionadas como RESOLVED (pois o conteudo foi removido)
    List<Report> reports =
        reportRepository.findByEntityIdAndType(commentId, Report.ReportType.COMMENT);
    reports.forEach(
        report -> {
          report.setStatus(Report.ReportStatus.RESOLVED);
          report.setActionTaken(Report.ActionTaken.CONTENT_REMOVED);
        });
    reportRepository.saveAll(reports);

    comment.setDeleted(true);
    commentRepository.save(comment);

    return commentMapper.toResponseDTO(
        "Comentario excluido com sucesso pelo administrador", comment);
  }

  @Transactional
  public ResponseDTO<CommentDTO> restoreCommentByAdmin(Long commentId) {
    Comment comment =
        commentRepository.findById(commentId).orElseThrow(CommentNotFoundException::new);
    Instant now = Instant.now();

    comment.setDeleted(false);
    commentRepository.save(comment);

    // Atualizar status dos reports relacionados para RESOLVED
    List<Report> reports =
        reportRepository.findByEntityIdAndType(commentId, Report.ReportType.COMMENT);
    reports.forEach(
        report -> {
          report.setStatus(Report.ReportStatus.RESOLVED);
          report.setActionTaken(Report.ActionTaken.NONE);
          report.setResolvedAt(now);
        });
    reportRepository.saveAll(reports);

    return commentMapper.toResponseDTO(
        "Comentario restaurado com sucesso pelo administrador", comment);
  }

  // ========== Acoes sobre Reports ==========

  @Transactional
  public ResponseDTO<String> dismissReports(Long entityId, String type) {
    Report.ReportType reportType = Report.ReportType.valueOf(type.toUpperCase());
    List<Report> reportsToDismiss = new java.util.ArrayList<>();
    reportsToDismiss.addAll(
        reportRepository.findByEntityIdAndTypeAndStatus(
            entityId, reportType, Report.ReportStatus.PENDING));
    reportsToDismiss.addAll(
        reportRepository.findByEntityIdAndTypeAndStatus(
            entityId, reportType, Report.ReportStatus.REVIEWED));

    if (reportsToDismiss.isEmpty()) {
      return new ResponseDTO<>("Nenhuma denuncia para descartar", "0 denuncias foram descartadas");
    }

    Instant now = Instant.now();
    reportsToDismiss.forEach(
        report -> {
          report.setStatus(Report.ReportStatus.RESOLVED);
          report.setActionTaken(Report.ActionTaken.NONE);
          report.setResolvedAt(now);
        });

    reportRepository.saveAll(reportsToDismiss);

    return new ResponseDTO<>(
        "Denuncias descartadas com sucesso",
        reportsToDismiss.size() + " denuncias foram descartadas");
  }

  @Transactional
  public ResponseDTO<String> markReportAsReviewed(Long entityId, String type) {
    Report.ReportType reportType = Report.ReportType.valueOf(type.toUpperCase());
    List<Report> reports =
        reportRepository.findByEntityIdAndTypeAndStatus(
            entityId, reportType, Report.ReportStatus.PENDING);
    Instant now = Instant.now();

    reports.forEach(
        report -> {
          report.setStatus(Report.ReportStatus.REVIEWED);
          report.setResolvedAt(now);
        });
    reportRepository.saveAll(reports);

    return new ResponseDTO<>(
        "Denuncias marcadas como em analise",
        reports.size() + " denuncias foram marcadas como em analise");
  }

  @Transactional
  public ResponseDTO<String> resolveReports(Long entityId, String type) {
    Report.ReportType reportType = Report.ReportType.valueOf(type.toUpperCase());
    List<Report> reportsToResolve = new java.util.ArrayList<>();
    reportsToResolve.addAll(
        reportRepository.findByEntityIdAndTypeAndStatus(
            entityId, reportType, Report.ReportStatus.PENDING));
    reportsToResolve.addAll(
        reportRepository.findByEntityIdAndTypeAndStatus(
            entityId, reportType, Report.ReportStatus.REVIEWED));

    if (reportsToResolve.isEmpty()) {
      return new ResponseDTO<>(
          "Nenhuma denuncia para resolver",
          "0 denuncias foram resolvidas e o conteudo foi mantido");
    }

    Instant now = Instant.now();
    reportsToResolve.forEach(
        report -> {
          report.setStatus(Report.ReportStatus.RESOLVED);
          report.setActionTaken(Report.ActionTaken.NONE);
          report.setResolvedAt(now);
        });

    reportRepository.saveAll(reportsToResolve);

    int totalResolved = reportsToResolve.size();

    return new ResponseDTO<>(
        "Denuncias resolvidas com sucesso",
        totalResolved + " denuncias foram resolvidas e o conteudo foi mantido");
  }

  // ========== Metodos Privados ==========

  private List<Long> extractEntityIds(List<Object[]> results) {
    return results.stream().map(result -> (Long) result[0]).distinct().collect(Collectors.toList());
  }

  private Map<Long, List<Report>> groupReportsByEntityId(
      List<Long> entityIds, Report.ReportType reportType) {
    if (entityIds.isEmpty()) {
      return Map.of();
    }

    return reportRepository.findByEntityIdInAndType(entityIds, reportType).stream()
        .collect(Collectors.groupingBy(Report::getEntityId));
  }

  private <T> Map<Long, T> indexById(List<T> entities, Function<T, Long> idExtractor) {
    return entities.stream().collect(Collectors.toMap(idExtractor, Function.identity()));
  }

  private String resolveReportedEntityStatus(boolean deleted, List<Report> reports) {
    if (deleted) {
      return "deleted";
    }

    boolean hasPending =
        reports.stream().anyMatch(report -> report.getStatus() == Report.ReportStatus.PENDING);
    if (hasPending) {
      return "pending";
    }

    boolean hasReviewed =
        reports.stream().anyMatch(report -> report.getStatus() == Report.ReportStatus.REVIEWED);
    if (hasReviewed) {
      return "reviewed";
    }

    return "resolved";
  }
}
