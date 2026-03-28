package com.weunite.api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.weunite.api.admin.reports.service.AdminReportService;
import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.opportunities.mapper.OpportunityMapper;
import com.weunite.api.opportunities.repository.OpportunityRepository;
import com.weunite.api.posts.domain.Post;
import com.weunite.api.posts.dto.PostDTO;
import com.weunite.api.posts.mapper.CommentMapper;
import com.weunite.api.posts.mapper.PostMapper;
import com.weunite.api.posts.repository.CommentRepository;
import com.weunite.api.posts.repository.PostRepository;
import com.weunite.api.reports.domain.Report;
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
    when(reportRepository.findByEntityIdAndType(postId, Report.ReportType.POST))
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
  @DisplayName("Should dismiss pending and reviewed reports in a single batch")
  void dismissReportsSuccess() {
    Long postId = 20L;

    Report pendingReport = new Report();
    pendingReport.setStatus(Report.ReportStatus.PENDING);
    pendingReport.setActionTaken(Report.ActionTaken.CONTENT_REMOVED);

    Report reviewedReport = new Report();
    reviewedReport.setStatus(Report.ReportStatus.REVIEWED);
    reviewedReport.setActionTaken(Report.ActionTaken.CONTENT_REMOVED);

    List<Report> pendingReports = List.of(pendingReport);
    List<Report> reviewedReports = List.of(reviewedReport);

    when(reportRepository.findByEntityIdAndTypeAndStatus(
            postId, Report.ReportType.POST, Report.ReportStatus.PENDING))
        .thenReturn(pendingReports);
    when(reportRepository.findByEntityIdAndTypeAndStatus(
            postId, Report.ReportType.POST, Report.ReportStatus.REVIEWED))
        .thenReturn(reviewedReports);

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

    when(reportRepository.findByEntityIdAndTypeAndStatus(
            postId, Report.ReportType.POST, Report.ReportStatus.PENDING))
        .thenReturn(List.of(pendingReport));
    when(reportRepository.findByEntityIdAndTypeAndStatus(
            postId, Report.ReportType.POST, Report.ReportStatus.REVIEWED))
        .thenReturn(List.of(reviewedReport));

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
        .findByEntityIdAndTypeAndStatus(
            postId, Report.ReportType.POST, Report.ReportStatus.RESOLVED);
  }

  @Test
  @DisplayName("Should return zero when there are no reports to resolve")
  void resolveReportsWithoutEntriesReturnsZero() {
    Long postId = 31L;

    when(reportRepository.findByEntityIdAndTypeAndStatus(
            postId, Report.ReportType.POST, Report.ReportStatus.PENDING))
        .thenReturn(List.of());
    when(reportRepository.findByEntityIdAndTypeAndStatus(
            postId, Report.ReportType.POST, Report.ReportStatus.REVIEWED))
        .thenReturn(List.of());

    ResponseDTO<String> result = adminReportService.resolveReports(postId, "POST");

    assertTrue(result.message().contains("resolver"));
    assertTrue(result.data().contains("0"));
    verify(reportRepository, never()).saveAll(anyList());
  }
}
