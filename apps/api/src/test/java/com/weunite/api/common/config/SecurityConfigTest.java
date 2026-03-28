package com.weunite.api.common.config;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityConfigTest {

  @Autowired private MockMvc mockMvc;

  @Test
  @DisplayName("Should require authentication for notification endpoints")
  void notificationsRequireAuthentication() throws Exception {
    mockMvc.perform(get("/api/notifications/user/1")).andExpect(status().isUnauthorized());
  }

  @Test
  @DisplayName("Should require authentication for sensitive report endpoints")
  void sensitiveReportEndpointsRequireAuthentication() throws Exception {
    mockMvc.perform(get("/api/reports/all")).andExpect(status().isUnauthorized());
    mockMvc.perform(get("/api/reports/status/PENDING")).andExpect(status().isUnauthorized());
    mockMvc.perform(get("/api/reports/pending")).andExpect(status().isUnauthorized());
  }

  @Test
  @DisplayName("Should require authentication for admin endpoints")
  void adminEndpointsRequireAuthentication() throws Exception {
    mockMvc.perform(get("/api/admin/posts/reported")).andExpect(status().isUnauthorized());
  }
}
