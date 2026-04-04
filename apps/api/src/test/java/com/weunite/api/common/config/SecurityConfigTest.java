package com.weunite.api.common.config;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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

  @Test
  @DisplayName("Should require authentication for opportunity mutation endpoints")
  void opportunityMutationEndpointsRequireAuthentication() throws Exception {
    mockMvc.perform(post("/api/opportunities/create/1")).andExpect(status().isUnauthorized());
    mockMvc.perform(put("/api/opportunities/update/1/2")).andExpect(status().isUnauthorized());
    mockMvc.perform(delete("/api/opportunities/delete/1/2")).andExpect(status().isUnauthorized());
  }

  @Test
  @DisplayName("Should require authentication for private opportunity state endpoints")
  void privateOpportunityStateEndpointsRequireAuthentication() throws Exception {
    mockMvc.perform(post("/api/subscriber/toggleSubscriber/1/2")).andExpect(status().isUnauthorized());
    mockMvc.perform(get("/api/subscriber/subscribers/2")).andExpect(status().isUnauthorized());
    mockMvc.perform(get("/api/subscriber/isSubscribed/1/2")).andExpect(status().isUnauthorized());
    mockMvc.perform(get("/api/subscriber/athlete/1")).andExpect(status().isUnauthorized());
    mockMvc.perform(post("/api/saved-opportunities/toggle/1/2")).andExpect(status().isUnauthorized());
    mockMvc.perform(get("/api/saved-opportunities/athlete/1")).andExpect(status().isUnauthorized());
    mockMvc.perform(get("/api/saved-opportunities/isSaved/1/2")).andExpect(status().isUnauthorized());
  }
}
