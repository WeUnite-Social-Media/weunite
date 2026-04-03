package com.weunite.api.admin.stats.controller;

import com.weunite.api.admin.stats.dto.DashboardActivityDTO;
import com.weunite.api.admin.stats.dto.DashboardDataDTO;
import com.weunite.api.admin.stats.dto.OpportunityByCategoryDTO;
import com.weunite.api.admin.stats.service.AdminStatsService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {

  private final AdminStatsService adminStatsService;

  public AdminDashboardController(AdminStatsService adminStatsService) {
    this.adminStatsService = adminStatsService;
  }

  @GetMapping("/stats")
  public ResponseEntity<DashboardDataDTO> getDashboardData(
      @RequestParam(defaultValue = "6") int months) {
    DashboardDataDTO dashboardData = adminStatsService.getDashboardData(months);
    return ResponseEntity.ok(dashboardData);
  }

  @GetMapping("/activity")
  public ResponseEntity<List<DashboardActivityDTO>> getDashboardActivity(
      @RequestParam(defaultValue = "6") int months) {
    List<DashboardActivityDTO> monthlyActivity = adminStatsService.getDashboardActivity(months);
    return ResponseEntity.ok(monthlyActivity);
  }

  @GetMapping("/opportunities-by-category")
  public ResponseEntity<List<OpportunityByCategoryDTO>> getOpportunitiesByCategory() {
    List<OpportunityByCategoryDTO> opportunitiesByCategory =
        adminStatsService.getOpportunitiesByCategory();
    return ResponseEntity.ok(opportunitiesByCategory);
  }
}
