package com.example.weuniteauth.mapper;

import com.example.weuniteauth.domain.report.Report;
import com.example.weuniteauth.dto.ResponseDTO;
import com.example.weuniteauth.dto.report.ReportDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface ReportMapper {

    @Mapping(target = "id", source = "report.id", resultType = String.class)
    @Mapping(target = "reporter", source = "report.reporter")
    @Mapping(target = "type", expression = "java(report.getType().name())")
    @Mapping(target = "entityId", source = "report.entityId")
    @Mapping(target = "reason", source = "report.reason")
    @Mapping(target = "status", expression = "java(report.getStatus().name())")
    @Mapping(target = "createdAt", source = "report.createdAt")
    ReportDTO toReportDTO(Report report);

    default ResponseDTO<ReportDTO> toResponseDTO(String message, Report report) {
        ReportDTO reportDTO = toReportDTO(report);
        return new ResponseDTO<>(message, reportDTO);
    }

    default List<ReportDTO> toReportDTOList(List<Report> reports) {
        if (reports == null || reports.isEmpty()) {
            return List.of();
        }

        return reports.stream()
                .map(this::toReportDTO)
                .toList();
    }
}

