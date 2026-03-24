package com.weunite.api.admin.reports.controller;

import com.weunite.api.admin.reports.service.AdminReportService;
import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.opportunities.dto.OpportunityDTO;
import com.weunite.api.posts.dto.CommentDTO;
import com.weunite.api.posts.dto.PostDTO;
import com.weunite.api.reports.dto.ReportSummaryDTO;
import com.weunite.api.reports.dto.ReportedCommentDetailDTO;
import com.weunite.api.reports.dto.ReportedOpportunityDetailDTO;
import com.weunite.api.reports.dto.ReportedPostDetailDTO;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminReportsController {

  private final AdminReportService adminReportService;

  public AdminReportsController(AdminReportService adminReportService) {
    this.adminReportService = adminReportService;
  }

  @GetMapping("/posts/reported")
  public ResponseEntity<List<ReportSummaryDTO>> getReportedPosts() {
    List<ReportSummaryDTO> reportedPosts = adminReportService.getPostsWithManyReports();
    return ResponseEntity.ok(reportedPosts);
  }

  @GetMapping("/posts/reported/details")
  public ResponseEntity<List<ReportedPostDetailDTO>> getReportedPostsDetails() {
    List<ReportedPostDetailDTO> reportedPosts = adminReportService.getReportedPostsDetails();
    return ResponseEntity.ok(reportedPosts);
  }

  @GetMapping("/posts/reported/{postId}")
  public ResponseEntity<ReportedPostDetailDTO> getReportedPostDetail(@PathVariable Long postId) {
    ReportedPostDetailDTO reportedPost = adminReportService.getReportedPostDetail(postId);
    return ResponseEntity.ok(reportedPost);
  }

  @GetMapping("/opportunities/reported")
  public ResponseEntity<List<ReportSummaryDTO>> getReportedOpportunities() {
    List<ReportSummaryDTO> reportedOpportunities =
        adminReportService.getOpportunitiesWithManyReports();
    return ResponseEntity.ok(reportedOpportunities);
  }

  @GetMapping("/opportunities/reported/details")
  public ResponseEntity<List<ReportedOpportunityDetailDTO>> getReportedOpportunitiesDetails() {
    List<ReportedOpportunityDetailDTO> reportedOpportunities =
        adminReportService.getReportedOpportunitiesDetails();
    return ResponseEntity.ok(reportedOpportunities);
  }

  @GetMapping("/opportunities/reported/{opportunityId}")
  public ResponseEntity<ReportedOpportunityDetailDTO> getReportedOpportunityDetail(
      @PathVariable Long opportunityId) {
    ReportedOpportunityDetailDTO reportedOpportunity =
        adminReportService.getReportedOpportunityDetail(opportunityId);
    return ResponseEntity.ok(reportedOpportunity);
  }

  @DeleteMapping("/posts/{postId}")
  public ResponseEntity<ResponseDTO<PostDTO>> deletePost(@PathVariable Long postId) {
    ResponseDTO<PostDTO> response = adminReportService.deletePostByAdmin(postId);
    return ResponseEntity.ok(response);
  }

  @PutMapping("/posts/{postId}/restore")
  public ResponseEntity<ResponseDTO<PostDTO>> restorePost(@PathVariable Long postId) {
    ResponseDTO<PostDTO> response = adminReportService.restorePostByAdmin(postId);
    return ResponseEntity.ok(response);
  }

  @DeleteMapping("/opportunities/{opportunityId}")
  public ResponseEntity<ResponseDTO<OpportunityDTO>> deleteOpportunity(
      @PathVariable Long opportunityId) {
    ResponseDTO<OpportunityDTO> response =
        adminReportService.deleteOpportunityByAdmin(opportunityId);
    return ResponseEntity.ok(response);
  }

  @PutMapping("/opportunities/{opportunityId}/restore")
  public ResponseEntity<ResponseDTO<OpportunityDTO>> restoreOpportunity(
      @PathVariable Long opportunityId) {
    ResponseDTO<OpportunityDTO> response =
        adminReportService.restoreOpportunityByAdmin(opportunityId);
    return ResponseEntity.ok(response);
  }

  @GetMapping("/comments/reported")
  public ResponseEntity<List<ReportSummaryDTO>> getReportedComments() {
    List<ReportSummaryDTO> reportedComments = adminReportService.getCommentsWithManyReports();
    return ResponseEntity.ok(reportedComments);
  }

  @GetMapping("/comments/reported/details")
  public ResponseEntity<List<ReportedCommentDetailDTO>> getReportedCommentsDetails() {
    List<ReportedCommentDetailDTO> reportedComments =
        adminReportService.getReportedCommentsDetails();
    return ResponseEntity.ok(reportedComments);
  }

  @GetMapping("/comments/reported/{commentId}")
  public ResponseEntity<ReportedCommentDetailDTO> getReportedCommentDetail(
      @PathVariable Long commentId) {
    ReportedCommentDetailDTO reportedComment =
        adminReportService.getReportedCommentDetail(commentId);
    return ResponseEntity.ok(reportedComment);
  }

  @DeleteMapping("/comments/{commentId}")
  public ResponseEntity<ResponseDTO<CommentDTO>> deleteComment(@PathVariable Long commentId) {
    ResponseDTO<CommentDTO> response = adminReportService.deleteCommentByAdmin(commentId);
    return ResponseEntity.ok(response);
  }

  @PutMapping("/comments/{commentId}/restore")
  public ResponseEntity<ResponseDTO<CommentDTO>> restoreComment(@PathVariable Long commentId) {
    ResponseDTO<CommentDTO> response = adminReportService.restoreCommentByAdmin(commentId);
    return ResponseEntity.ok(response);
  }

  @PutMapping("/reports/dismiss/{entityId}/{type}")
  public ResponseEntity<ResponseDTO<String>> dismissReports(
      @PathVariable Long entityId, @PathVariable String type) {
    ResponseDTO<String> response = adminReportService.dismissReports(entityId, type);
    return ResponseEntity.ok(response);
  }

  @PutMapping("/reports/review/{entityId}/{type}")
  public ResponseEntity<ResponseDTO<String>> markReportAsReviewed(
      @PathVariable Long entityId, @PathVariable String type) {
    ResponseDTO<String> response = adminReportService.markReportAsReviewed(entityId, type);
    return ResponseEntity.ok(response);
  }

  @PutMapping("/reports/resolve/{entityId}/{type}")
  public ResponseEntity<ResponseDTO<String>> resolveReports(
      @PathVariable Long entityId, @PathVariable String type) {
    ResponseDTO<String> response = adminReportService.resolveReports(entityId, type);
    return ResponseEntity.ok(response);
  }
}
