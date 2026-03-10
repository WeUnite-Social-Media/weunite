package com.example.weuniteauth.controller;

import com.example.weuniteauth.dto.OpportunityDTO;
import com.example.weuniteauth.dto.PostDTO;
import com.example.weuniteauth.dto.ResponseDTO;
import com.example.weuniteauth.dto.report.ReportSummaryDTO;
import com.example.weuniteauth.dto.report.ReportedPostDetailDTO;
import com.example.weuniteauth.dto.report.ReportedOpportunityDetailDTO;
import com.example.weuniteauth.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/posts/reported")
    public ResponseEntity<List<ReportSummaryDTO>> getReportedPosts() {
        List<ReportSummaryDTO> reportedPosts = adminService.getPostsWithManyReports();
        return ResponseEntity.ok(reportedPosts);
    }

    @GetMapping("/posts/reported/details")
    public ResponseEntity<List<ReportedPostDetailDTO>> getReportedPostsDetails() {
        List<ReportedPostDetailDTO> reportedPosts = adminService.getReportedPostsDetails();
        return ResponseEntity.ok(reportedPosts);
    }

    @GetMapping("/posts/reported/{postId}")
    public ResponseEntity<ReportedPostDetailDTO> getReportedPostDetail(@PathVariable Long postId) {
        ReportedPostDetailDTO reportedPost = adminService.getReportedPostDetail(postId);
        return ResponseEntity.ok(reportedPost);
    }

    @GetMapping("/opportunities/reported")
    public ResponseEntity<List<ReportSummaryDTO>> getReportedOpportunities() {
        List<ReportSummaryDTO> reportedOpportunities = adminService.getOpportunitiesWithManyReports();
        return ResponseEntity.ok(reportedOpportunities);
    }

    @GetMapping("/opportunities/reported/details")
    public ResponseEntity<List<ReportedOpportunityDetailDTO>> getReportedOpportunitiesDetails() {
        List<ReportedOpportunityDetailDTO> reportedOpportunities = adminService.getReportedOpportunitiesDetails();
        return ResponseEntity.ok(reportedOpportunities);
    }

    @GetMapping("/opportunities/reported/{opportunityId}")
    public ResponseEntity<ReportedOpportunityDetailDTO> getReportedOpportunityDetail(@PathVariable Long opportunityId) {
        ReportedOpportunityDetailDTO reportedOpportunity = adminService.getReportedOpportunityDetail(opportunityId);
        return ResponseEntity.ok(reportedOpportunity);
    }

    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<ResponseDTO<PostDTO>> deletePost(@PathVariable Long postId) {
        ResponseDTO<PostDTO> response = adminService.deletePostByAdmin(postId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/opportunities/{opportunityId}")
    public ResponseEntity<ResponseDTO<OpportunityDTO>> deleteOpportunity(@PathVariable Long opportunityId) {
        ResponseDTO<OpportunityDTO> response = adminService.deleteOpportunityByAdmin(opportunityId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/reports/dismiss/{entityId}/{type}")
    public ResponseEntity<ResponseDTO<String>> dismissReports(
            @PathVariable Long entityId,
            @PathVariable String type) {
        ResponseDTO<String> response = adminService.dismissReports(entityId, type);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/reports/review/{entityId}/{type}")
    public ResponseEntity<ResponseDTO<String>> markReportAsReviewed(
            @PathVariable Long entityId,
            @PathVariable String type) {
        ResponseDTO<String> response = adminService.markReportAsReviewed(entityId, type);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/reports/resolve/{entityId}/{type}")
    public ResponseEntity<ResponseDTO<String>> resolveReports(
            @PathVariable Long entityId,
            @PathVariable String type) {
        ResponseDTO<String> response = adminService.resolveReports(entityId, type);
        return ResponseEntity.ok(response);
    }
}

