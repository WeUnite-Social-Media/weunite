package com.weunite.api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.weunite.api.admin.reports.service.AdminReportService;
import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.opportunities.domain.Opportunity;
import com.weunite.api.opportunities.dto.OpportunityDTO;
import com.weunite.api.opportunities.mapper.OpportunityMapper;
import com.weunite.api.opportunities.repository.OpportunityRepository;
import com.weunite.api.posts.domain.Comment;
import com.weunite.api.posts.domain.Post;
import com.weunite.api.posts.dto.CommentDTO;
import com.weunite.api.posts.dto.PostDTO;
import com.weunite.api.posts.mapper.CommentMapper;
import com.weunite.api.posts.mapper.PostMapper;
import com.weunite.api.posts.repository.CommentRepository;
import com.weunite.api.posts.repository.PostRepository;
import com.weunite.api.reports.domain.Report;
import com.weunite.api.reports.domain.ReportTarget;
import com.weunite.api.reports.dto.ReportDTO;
import com.weunite.api.reports.dto.ReportedCommentDetailDTO;
import com.weunite.api.reports.dto.ReportedOpportunityDetailDTO;
import com.weunite.api.reports.dto.ReportedPostDetailDTO;
import com.weunite.api.reports.mapper.ReportMapper;
import com.weunite.api.reports.repository.ReportRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AdminReportServiceTest {

  @Mock private ReportRepository reportRepository;
  @Mock private PostRepository postRepository;
  @Mock private OpportunityRepository opportunityRepository;
  @Mock private CommentRepository commentRepository;
  @Mock private PostMapper postMapper;
  @Mock private OpportunityMapper opportunityMapper;
  @Mock private CommentMapper commentMapper;
  @Mock private ReportMapper reportMapper;

  @InjectMocks private AdminReportService adminReportService;

  @Test
  @DisplayName("Should soft delete reported post and resolve related reports")
  void deletePostByAdminSuccess() {
    Long postId = 10L;
    Post post = new Post();
    post.setId(postId);

    Report pendingReport = new Report();
    pendingReport.setStatus(Report.ReportStatus.PENDING);
    pendingReport.setActionTaken(Report.ActionTaken.NONE);

    Report reviewedReport = new Report();
    reviewedReport.setStatus(Report.ReportStatus.REVIEWED);
    reviewedReport.setActionTaken(Report.ActionTaken.NONE);

    List<Report> relatedReports = List.of(pendingReport, reviewedReport);
    ResponseDTO<PostDTO> expectedResponse = new ResponseDTO<>("ok", null);

    when(postRepository.findById(postId)).thenReturn(Optional.of(post));
    when(reportRepository.findByTarget(new ReportTarget(Report.ReportType.POST, postId)))
        .thenReturn(relatedReports);
    when(postMapper.toResponseDTO(anyString(), eq(post))).thenReturn(expectedResponse);

    ResponseDTO<PostDTO> result = adminReportService.deletePostByAdmin(postId);

    assertEquals(expectedResponse, result);
    assertTrue(post.isDeleted());
    assertEquals(Report.ReportStatus.RESOLVED, pendingReport.getStatus());
    assertEquals(Report.ReportStatus.RESOLVED, reviewedReport.getStatus());
    assertEquals(Report.ActionTaken.CONTENT_REMOVED, pendingReport.getActionTaken());
    assertEquals(Report.ActionTaken.CONTENT_REMOVED, reviewedReport.getActionTaken());
    verify(reportRepository).saveAll(relatedReports);
    verify(postRepository).save(post);
  }

  @Test
  @DisplayName("Should load reported posts in bulk without per-item queries")
  void getReportedPostsDetailsLoadsDataInBulk() {
    Long existingPostId = 10L;
    Long deletedPostId = 20L;
    List<Object[]> results =
        List.of(
            new Object[] {existingPostId, Report.ReportType.POST, 1L},
            new Object[] {deletedPostId, Report.ReportType.POST, 1L});

    Post post = new Post();
    post.setId(existingPostId);
    post.setDeleted(false);

    Report pendingPostReport = new Report();
    pendingPostReport.setEntityId(existingPostId);
    pendingPostReport.setStatus(Report.ReportStatus.PENDING);

    Report deletedPostReport = new Report();
    deletedPostReport.setEntityId(deletedPostId);
    deletedPostReport.setStatus(Report.ReportStatus.RESOLVED);

    PostDTO mappedPostDTO =
        new PostDTO(
            "10", "post text", null, List.of(), List.of(), List.of(), null, null, null, null, null);
    ReportDTO pendingReportDTO =
        new ReportDTO("1", null, "POST", existingPostId, "reason", "pending", null);
    ReportDTO deletedReportDTO =
        new ReportDTO("2", null, "POST", deletedPostId, "reason", "resolved", null);

    when(reportRepository.findAllEntitiesWithReports(Report.ReportType.POST, 1L))
        .thenReturn(results);
    when(postRepository.findAllById(List.of(existingPostId, deletedPostId)))
        .thenReturn(List.of(post));
    when(reportRepository.findByEntityIdInAndType(
            List.of(existingPostId, deletedPostId), Report.ReportType.POST))
        .thenReturn(List.of(pendingPostReport, deletedPostReport));
    when(postMapper.toPostDTO(post)).thenReturn(mappedPostDTO);
    when(reportMapper.toReportDTOList(List.of(pendingPostReport)))
        .thenReturn(List.of(pendingReportDTO));
    when(reportMapper.toReportDTOList(List.of(deletedPostReport)))
        .thenReturn(List.of(deletedReportDTO));

    List<ReportedPostDetailDTO> reportedPosts = adminReportService.getReportedPostsDetails();

    assertEquals(2, reportedPosts.size());
    assertEquals(mappedPostDTO, reportedPosts.get(0).post());
    assertEquals("pending", reportedPosts.get(0).status());
    assertEquals(1L, reportedPosts.get(0).totalReports());
    assertEquals("Conteudo removido permanentemente", reportedPosts.get(1).post().text());
    assertEquals("deleted", reportedPosts.get(1).status());

    verify(postRepository).findAllById(List.of(existingPostId, deletedPostId));
    verify(reportRepository)
        .findByEntityIdInAndType(List.of(existingPostId, deletedPostId), Report.ReportType.POST);
    verify(postRepository, never()).findById(anyLong());
    verify(reportRepository, never()).findByTarget(any(ReportTarget.class));
  }

  @Test
  @DisplayName("Should load reported opportunities in bulk without per-item queries")
  void getReportedOpportunitiesDetailsLoadsDataInBulk() {
    Long existingOpportunityId = 30L;
    Long deletedOpportunityId = 40L;
    List<Object[]> results =
        List.of(
            new Object[] {existingOpportunityId, Report.ReportType.OPPORTUNITY, 1L},
            new Object[] {deletedOpportunityId, Report.ReportType.OPPORTUNITY, 1L});

    Opportunity opportunity = new Opportunity();
    opportunity.setId(existingOpportunityId);
    opportunity.setDeleted(false);

    Report reviewedOpportunityReport = new Report();
    reviewedOpportunityReport.setEntityId(existingOpportunityId);
    reviewedOpportunityReport.setStatus(Report.ReportStatus.REVIEWED);

    Report deletedOpportunityReport = new Report();
    deletedOpportunityReport.setEntityId(deletedOpportunityId);
    deletedOpportunityReport.setStatus(Report.ReportStatus.RESOLVED);

    OpportunityDTO mappedOpportunityDTO =
        new OpportunityDTO(
            existingOpportunityId,
            "Opportunity",
            "Description",
            "Remote",
            null,
            java.util.Set.of(),
            null,
            null,
            null,
            0);
    ReportDTO reviewedReportDTO =
        new ReportDTO("3", null, "OPPORTUNITY", existingOpportunityId, "reason", "reviewed", null);
    ReportDTO deletedReportDTO =
        new ReportDTO("4", null, "OPPORTUNITY", deletedOpportunityId, "reason", "resolved", null);

    when(reportRepository.findAllEntitiesWithReports(Report.ReportType.OPPORTUNITY, 1L))
        .thenReturn(results);
    when(opportunityRepository.findAllById(List.of(existingOpportunityId, deletedOpportunityId)))
        .thenReturn(List.of(opportunity));
    when(reportRepository.findByEntityIdInAndType(
            List.of(existingOpportunityId, deletedOpportunityId), Report.ReportType.OPPORTUNITY))
        .thenReturn(List.of(reviewedOpportunityReport, deletedOpportunityReport));
    when(opportunityMapper.toOpportunityDTO(opportunity)).thenReturn(mappedOpportunityDTO);
    when(reportMapper.toReportDTOList(List.of(reviewedOpportunityReport)))
        .thenReturn(List.of(reviewedReportDTO));
    when(reportMapper.toReportDTOList(List.of(deletedOpportunityReport)))
        .thenReturn(List.of(deletedReportDTO));

    List<ReportedOpportunityDetailDTO> reportedOpportunities =
        adminReportService.getReportedOpportunitiesDetails();

    assertEquals(2, reportedOpportunities.size());
    assertEquals(mappedOpportunityDTO, reportedOpportunities.get(0).opportunity());
    assertEquals("reviewed", reportedOpportunities.get(0).status());
    assertEquals(
        "Oportunidade removida permanentemente",
        reportedOpportunities.get(1).opportunity().title());
    assertEquals("deleted", reportedOpportunities.get(1).status());

    verify(opportunityRepository).findAllById(List.of(existingOpportunityId, deletedOpportunityId));
    verify(reportRepository)
        .findByEntityIdInAndType(
            List.of(existingOpportunityId, deletedOpportunityId), Report.ReportType.OPPORTUNITY);
    verify(opportunityRepository, never()).findById(anyLong());
    verify(reportRepository, never()).findByTarget(any(ReportTarget.class));
  }

  @Test
  @DisplayName("Should load reported comments in bulk without per-item queries")
  void getReportedCommentsDetailsLoadsDataInBulk() {
    Long existingCommentId = 50L;
    Long deletedCommentId = 60L;
    List<Object[]> results =
        List.of(
            new Object[] {existingCommentId, Report.ReportType.COMMENT, 1L},
            new Object[] {deletedCommentId, Report.ReportType.COMMENT, 1L});

    Comment comment = new Comment();
    comment.setId(existingCommentId);
    comment.setDeleted(false);

    Report pendingCommentReport = new Report();
    pendingCommentReport.setEntityId(existingCommentId);
    pendingCommentReport.setStatus(Report.ReportStatus.PENDING);

    Report deletedCommentReport = new Report();
    deletedCommentReport.setEntityId(deletedCommentId);
    deletedCommentReport.setStatus(Report.ReportStatus.RESOLVED);

    CommentDTO mappedCommentDTO =
        new CommentDTO("50", null, null, "Comment text", null, null, List.of(), null, null);
    ReportDTO pendingReportDTO =
        new ReportDTO("5", null, "COMMENT", existingCommentId, "reason", "pending", null);
    ReportDTO deletedReportDTO =
        new ReportDTO("6", null, "COMMENT", deletedCommentId, "reason", "resolved", null);

    when(reportRepository.findAllEntitiesWithReports(Report.ReportType.COMMENT, 1L))
        .thenReturn(results);
    when(commentRepository.findAllById(List.of(existingCommentId, deletedCommentId)))
        .thenReturn(List.of(comment));
    when(reportRepository.findByEntityIdInAndType(
            List.of(existingCommentId, deletedCommentId), Report.ReportType.COMMENT))
        .thenReturn(List.of(pendingCommentReport, deletedCommentReport));
    when(commentMapper.toCommentDTO(comment)).thenReturn(mappedCommentDTO);
    when(reportMapper.toReportDTOList(List.of(pendingCommentReport)))
        .thenReturn(List.of(pendingReportDTO));
    when(reportMapper.toReportDTOList(List.of(deletedCommentReport)))
        .thenReturn(List.of(deletedReportDTO));

    List<ReportedCommentDetailDTO> reportedComments =
        adminReportService.getReportedCommentsDetails();

    assertEquals(2, reportedComments.size());
    assertEquals(mappedCommentDTO, reportedComments.get(0).comment());
    assertEquals("pending", reportedComments.get(0).status());
    assertEquals("Comentario removido permanentemente", reportedComments.get(1).comment().text());
    assertEquals("deleted", reportedComments.get(1).status());

    verify(commentRepository).findAllById(List.of(existingCommentId, deletedCommentId));
    verify(reportRepository)
        .findByEntityIdInAndType(
            List.of(existingCommentId, deletedCommentId), Report.ReportType.COMMENT);
    verify(commentRepository, never()).findById(anyLong());
    verify(reportRepository, never()).findByTarget(any(ReportTarget.class));
  }

  @Test
  @DisplayName("Should dismiss pending and reviewed reports in a single batch")
  void dismissReportsSuccess() {
    Long postId = 20L;

    Report pendingReport = new Report();
    pendingReport.setStatus(Report.ReportStatus.PENDING);
    pendingReport.setActionTaken(Report.ActionTaken.CONTENT_REMOVED);

    Report reviewedReport = new Report();
    reviewedReport.setStatus(Report.ReportStatus.REVIEWED);
    reviewedReport.setActionTaken(Report.ActionTaken.CONTENT_REMOVED);

    when(reportRepository.findByTargetAndStatusIn(
            new ReportTarget(Report.ReportType.POST, postId),
            List.of(Report.ReportStatus.PENDING, Report.ReportStatus.REVIEWED)))
        .thenReturn(List.of(pendingReport, reviewedReport));

    ResponseDTO<String> result = adminReportService.dismissReports(postId, "POST");

    assertNotNull(result.message());
    assertNotNull(result.data());
    assertTrue(result.data().contains("2"));
    assertEquals(Report.ReportStatus.RESOLVED, pendingReport.getStatus());
    assertEquals(Report.ReportStatus.RESOLVED, reviewedReport.getStatus());
    assertEquals(Report.ActionTaken.NONE, pendingReport.getActionTaken());
    assertEquals(Report.ActionTaken.NONE, reviewedReport.getActionTaken());
    assertNotNull(pendingReport.getResolvedAt());
    assertSame(pendingReport.getResolvedAt(), reviewedReport.getResolvedAt());

    ArgumentCaptor<List<Report>> savedReportsCaptor = ArgumentCaptor.forClass(List.class);
    verify(reportRepository).saveAll(savedReportsCaptor.capture());
    assertEquals(2, savedReportsCaptor.getValue().size());
  }

  @Test
  @DisplayName("Should resolve only pending and reviewed reports")
  void resolveReportsIgnoresAlreadyResolvedEntries() {
    Long postId = 30L;

    Report pendingReport = new Report();
    pendingReport.setStatus(Report.ReportStatus.PENDING);
    pendingReport.setActionTaken(Report.ActionTaken.CONTENT_REMOVED);

    Report reviewedReport = new Report();
    reviewedReport.setStatus(Report.ReportStatus.REVIEWED);
    reviewedReport.setActionTaken(Report.ActionTaken.CONTENT_REMOVED);

    when(reportRepository.findByTargetAndStatusIn(
            new ReportTarget(Report.ReportType.POST, postId),
            List.of(Report.ReportStatus.PENDING, Report.ReportStatus.REVIEWED)))
        .thenReturn(List.of(pendingReport, reviewedReport));

    ResponseDTO<String> result = adminReportService.resolveReports(postId, "POST");

    assertTrue(result.data().contains("2"));
    assertEquals(Report.ReportStatus.RESOLVED, pendingReport.getStatus());
    assertEquals(Report.ReportStatus.RESOLVED, reviewedReport.getStatus());
    assertEquals(Report.ActionTaken.NONE, pendingReport.getActionTaken());
    assertEquals(Report.ActionTaken.NONE, reviewedReport.getActionTaken());

    ArgumentCaptor<List<Report>> savedReportsCaptor = ArgumentCaptor.forClass(List.class);
    verify(reportRepository).saveAll(savedReportsCaptor.capture());
    assertEquals(2, savedReportsCaptor.getValue().size());
    verify(reportRepository, never())
        .findByTargetAndStatus(any(ReportTarget.class), eq(Report.ReportStatus.RESOLVED));
  }

  @Test
  @DisplayName("Should return zero when there are no reports to resolve")
  void resolveReportsWithoutEntriesReturnsZero() {
    Long postId = 31L;

    when(reportRepository.findByTargetAndStatusIn(
            new ReportTarget(Report.ReportType.POST, postId),
            List.of(Report.ReportStatus.PENDING, Report.ReportStatus.REVIEWED)))
        .thenReturn(List.of());

    ResponseDTO<String> result = adminReportService.resolveReports(postId, "POST");

    assertTrue(result.message().contains("resolver"));
    assertTrue(result.data().contains("0"));
    verify(reportRepository, never()).saveAll(anyList());
  }
}
