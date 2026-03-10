package com.example.weuniteauth.service;

import com.example.weuniteauth.domain.opportunity.Opportunity;
import com.example.weuniteauth.domain.post.Post;
import com.example.weuniteauth.domain.report.Report;
import com.example.weuniteauth.dto.OpportunityDTO;
import com.example.weuniteauth.dto.PostDTO;
import com.example.weuniteauth.dto.ResponseDTO;
import com.example.weuniteauth.dto.report.ReportDTO;
import com.example.weuniteauth.dto.report.ReportSummaryDTO;
import com.example.weuniteauth.dto.report.ReportedPostDetailDTO;
import com.example.weuniteauth.dto.report.ReportedOpportunityDetailDTO;
import com.example.weuniteauth.exceptions.opportunity.OpportunityNotFoundException;
import com.example.weuniteauth.exceptions.post.PostNotFoundException;
import com.example.weuniteauth.mapper.OpportunityMapper;
import com.example.weuniteauth.mapper.PostMapper;
import com.example.weuniteauth.mapper.ReportMapper;
import com.example.weuniteauth.repository.OpportunityRepository;
import com.example.weuniteauth.repository.PostRepository;
import com.example.weuniteauth.repository.ReportRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final ReportRepository reportRepository;
    private final PostRepository postRepository;
    private final OpportunityRepository opportunityRepository;
    private final PostMapper postMapper;
    private final OpportunityMapper opportunityMapper;
    private final ReportMapper reportMapper;
    private static final Long REPORT_THRESHOLD = 1L;

    public AdminService(ReportRepository reportRepository,
                        PostRepository postRepository,
                        OpportunityRepository opportunityRepository,
                        PostMapper postMapper,
                        OpportunityMapper opportunityMapper,
                        ReportMapper reportMapper) {
        this.reportRepository = reportRepository;
        this.postRepository = postRepository;
        this.opportunityRepository = opportunityRepository;
        this.postMapper = postMapper;
        this.opportunityMapper = opportunityMapper;
        this.reportMapper = reportMapper;
    }

    @Transactional(readOnly = true)
    public List<ReportSummaryDTO> getPostsWithManyReports() {
        List<Object[]> results = reportRepository.findEntitiesWithManyReports(
                Report.ReportType.POST,
                REPORT_THRESHOLD
        );

        return results.stream()
                .map(result -> new ReportSummaryDTO(
                        (Long) result[0],
                        ((Report.ReportType) result[1]).name(),
                        (Long) result[2]
                ))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReportSummaryDTO> getOpportunitiesWithManyReports() {
        List<Object[]> results = reportRepository.findEntitiesWithManyReports(
                Report.ReportType.OPPORTUNITY,
                REPORT_THRESHOLD
        );

        return results.stream()
                .map(result -> new ReportSummaryDTO(
                        (Long) result[0],
                        ((Report.ReportType) result[1]).name(),
                        (Long) result[2]
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public ResponseDTO<PostDTO> deletePostByAdmin(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(PostNotFoundException::new);

        markReportsAsReviewed(postId, Report.ReportType.POST);

        postRepository.delete(post);

        return postMapper.toResponseDTO("Post excluído com sucesso pelo administrador", post);
    }

    @Transactional
    public ResponseDTO<OpportunityDTO> deleteOpportunityByAdmin(Long opportunityId) {
        Opportunity opportunity = opportunityRepository.findById(opportunityId)
                .orElseThrow(OpportunityNotFoundException::new);

        markReportsAsReviewed(opportunityId, Report.ReportType.OPPORTUNITY);

        opportunityRepository.delete(opportunity);

        return opportunityMapper.toResponseDTO("Oportunidade excluída com sucesso pelo administrador", opportunity);
    }

    @Transactional
    public ResponseDTO<String> dismissReports(Long entityId, String type) {
        Report.ReportType reportType = Report.ReportType.valueOf(type.toUpperCase());
        List<Report> reports = reportRepository.findByEntityIdAndTypeAndStatus(
                entityId,
                reportType,
                Report.ReportStatus.PENDING
        );

        reports.forEach(report -> report.setStatus(Report.ReportStatus.DISMISSED));
        reportRepository.saveAll(reports);

        return new ResponseDTO<>(
                "Denúncias descartadas com sucesso",
                reports.size() + " denúncias foram descartadas"
        );
    }

    @Transactional
    public ResponseDTO<String> markReportAsReviewed(Long entityId, String type) {
        Report.ReportType reportType = Report.ReportType.valueOf(type.toUpperCase());
        List<Report> reports = reportRepository.findByEntityIdAndTypeAndStatus(
                entityId,
                reportType,
                Report.ReportStatus.PENDING
        );

        reports.forEach(report -> report.setStatus(Report.ReportStatus.REVIEWED));
        reportRepository.saveAll(reports);

        return new ResponseDTO<>(
                "Denúncias marcadas como revisadas",
                reports.size() + " denúncias foram marcadas como em análise"
        );
    }

    @Transactional
    public ResponseDTO<String> resolveReports(Long entityId, String type) {
        Report.ReportType reportType = Report.ReportType.valueOf(type.toUpperCase());
        List<Report> reports = reportRepository.findByEntityIdAndTypeAndStatus(
                entityId,
                reportType,
                Report.ReportStatus.PENDING
        );

        List<Report> reviewedReports = reportRepository.findByEntityIdAndTypeAndStatus(
                entityId,
                reportType,
                Report.ReportStatus.REVIEWED
        );

        reports.forEach(report -> report.setStatus(Report.ReportStatus.DISMISSED));
        reviewedReports.forEach(report -> report.setStatus(Report.ReportStatus.DISMISSED));
        
        reportRepository.saveAll(reports);
        reportRepository.saveAll(reviewedReports);

        int totalResolved = reports.size() + reviewedReports.size();

        return new ResponseDTO<>(
                "Denúncias resolvidas com sucesso",
                totalResolved + " denúncias foram resolvidas e o conteúdo foi mantido"
        );
    }

    private void markReportsAsReviewed(Long entityId, Report.ReportType type) {
        List<Report> reports = reportRepository.findByEntityIdAndTypeAndStatus(
                entityId,
                type,
                Report.ReportStatus.PENDING
        );
        reports.forEach(report -> report.setStatus(Report.ReportStatus.REVIEWED));
        reportRepository.saveAll(reports);
    }

    @Transactional(readOnly = true)
    public List<ReportedPostDetailDTO> getReportedPostsDetails() {
        List<Object[]> results = reportRepository.findEntitiesWithManyReports(
                Report.ReportType.POST,
                REPORT_THRESHOLD
        );

        return results.stream()
                .map(result -> {
                    Long postId = (Long) result[0];
                    Long reportCount = (Long) result[2];

                    Post post = postRepository.findById(postId)
                            .orElseThrow(PostNotFoundException::new);

                    List<Report> reports = reportRepository.findByEntityIdAndTypeAndStatus(
                            postId,
                            Report.ReportType.POST,
                            Report.ReportStatus.PENDING
                    );

                    PostDTO postDTO = postMapper.toPostDTO(post);
                    List<ReportDTO> reportDTOs = reportMapper.toReportDTOList(reports);

                    return new ReportedPostDetailDTO(
                            postDTO,
                            reportDTOs,
                            reportCount,
                            "pending"
                    );
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReportedOpportunityDetailDTO> getReportedOpportunitiesDetails() {
        List<Object[]> results = reportRepository.findEntitiesWithManyReports(
                Report.ReportType.OPPORTUNITY,
                REPORT_THRESHOLD
        );

        return results.stream()
                .map(result -> {
                    Long opportunityId = (Long) result[0];
                    Long reportCount = (Long) result[2];

                    Opportunity opportunity = opportunityRepository.findById(opportunityId)
                            .orElseThrow(OpportunityNotFoundException::new);

                    List<Report> reports = reportRepository.findByEntityIdAndTypeAndStatus(
                            opportunityId,
                            Report.ReportType.OPPORTUNITY,
                            Report.ReportStatus.PENDING
                    );

                    OpportunityDTO opportunityDTO = opportunityMapper.toOpportunityDTO(opportunity);
                    List<ReportDTO> reportDTOs = reportMapper.toReportDTOList(reports);

                    return new ReportedOpportunityDetailDTO(
                            opportunityDTO,
                            reportDTOs,
                            reportCount,
                            "pending"
                    );
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ReportedPostDetailDTO getReportedPostDetail(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(PostNotFoundException::new);

        List<Report> reports = reportRepository.findByEntityIdAndTypeAndStatus(
                postId,
                Report.ReportType.POST,
                Report.ReportStatus.PENDING
        );

        PostDTO postDTO = postMapper.toPostDTO(post);
        List<ReportDTO> reportDTOs = reportMapper.toReportDTOList(reports);

        return new ReportedPostDetailDTO(
                postDTO,
                reportDTOs,
                (long) reports.size(),
                reports.isEmpty() ? "resolved" : "pending"
        );
    }

    @Transactional(readOnly = true)
    public ReportedOpportunityDetailDTO getReportedOpportunityDetail(Long opportunityId) {
        Opportunity opportunity = opportunityRepository.findById(opportunityId)
                .orElseThrow(OpportunityNotFoundException::new);

        List<Report> reports = reportRepository.findByEntityIdAndTypeAndStatus(
                opportunityId,
                Report.ReportType.OPPORTUNITY,
                Report.ReportStatus.PENDING
        );

        OpportunityDTO opportunityDTO = opportunityMapper.toOpportunityDTO(opportunity);
        List<ReportDTO> reportDTOs = reportMapper.toReportDTOList(reports);

        return new ReportedOpportunityDetailDTO(
                opportunityDTO,
                reportDTOs,
                (long) reports.size(),
                reports.isEmpty() ? "resolved" : "pending"
        );
    }
}

