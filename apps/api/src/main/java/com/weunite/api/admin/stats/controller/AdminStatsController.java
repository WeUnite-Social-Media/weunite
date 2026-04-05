package com.weunite.api.admin.stats.controller;

import com.weunite.api.admin.stats.dto.AdminStatsDTO;
import com.weunite.api.admin.stats.dto.MonthlyDataDTO;
import com.weunite.api.admin.stats.dto.OpportunityCategoryWithSkillsDTO;
import com.weunite.api.admin.stats.dto.UserTypeDataDTO;
import com.weunite.api.admin.stats.service.AdminStatsService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/stats")
public class AdminStatsController {

  private final AdminStatsService adminStatsService;

  public AdminStatsController(AdminStatsService adminStatsService) {
    this.adminStatsService = adminStatsService;
  }

  @GetMapping
  public ResponseEntity<AdminStatsDTO> getAdminStats() {
    AdminStatsDTO stats = adminStatsService.getAdminStats();
    return ResponseEntity.ok(stats);
  }

  @GetMapping("/monthly")
  public ResponseEntity<List<MonthlyDataDTO>> getMonthlyData() {
    List<MonthlyDataDTO> monthlyData = adminStatsService.getMonthlyData();
    return ResponseEntity.ok(monthlyData);
  }

  @GetMapping("/user-types")
  public ResponseEntity<List<UserTypeDataDTO>> getUserTypeData() {
    List<UserTypeDataDTO> userTypeData = adminStatsService.getUserTypeData();
    return ResponseEntity.ok(userTypeData);
  }

  @GetMapping("/opportunities-skills")
  public ResponseEntity<List<OpportunityCategoryWithSkillsDTO>> getOpportunitiesWithSkills() {
    List<OpportunityCategoryWithSkillsDTO> opportunitiesWithSkills =
        adminStatsService.getOpportunitiesWithSkills();
    return ResponseEntity.ok(opportunitiesWithSkills);
  }
}
