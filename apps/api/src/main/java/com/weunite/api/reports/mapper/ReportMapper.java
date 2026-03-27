package com.weunite.api.reports.mapper;

import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.reports.domain.Report;
import com.weunite.api.reports.dto.ReportDTO;
import com.weunite.api.users.mapper.UserMapper;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(
    componentModel = "spring",
    uses = {UserMapper.class})
public interface ReportMapper {

  @Mapping(target = "id", source = "report.id", resultType = String.class)
  @Mapping(target = "reporter", source = "report.reporter")
  @Mapping(target = "type", expression = "java(report.getType().name())")
  @Mapping(target = "entityId", source = "report.entityId")
  @Mapping(target = "reason", source = "report.reason")
  @Mapping(target = "status", expression = "java(report.getStatus().name().toLowerCase())")
  @Mapping(target = "createdAt", source = "report.createdAt")
  @Mapping(target = "resolvedAt", source = "report.resolvedAt")
  @Mapping(target = "resolvedByAdminId", source = "report.resolvedByAdminId")
  ReportDTO toReportDTO(Report report);

  default ResponseDTO<ReportDTO> toResponseDTO(String message, Report report) {
    ReportDTO reportDTO = toReportDTO(report);
    return new ResponseDTO<>(message, reportDTO);
  }

  default List<ReportDTO> toReportDTOList(List<Report> reports) {
    if (reports == null || reports.isEmpty()) {
      return List.of();
    }

    return reports.stream().map(this::toReportDTO).toList();
  }
}
