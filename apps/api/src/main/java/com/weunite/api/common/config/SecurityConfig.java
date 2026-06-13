package com.weunite.api.common.config;

import java.util.Collection;
import java.util.Locale;
import java.util.Map;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http.cors(Customizer.withDefaults())
        .csrf(csrf -> csrf.disable())
        .authorizeHttpRequests(
            authorize ->
                authorize
                    .requestMatchers("/ws/**")
                    .permitAll()
                    .requestMatchers("/ws")
                    .permitAll()
                    .requestMatchers("/uploads/**")
                    .permitAll()

                    // Auth endpoints
                    .requestMatchers(HttpMethod.POST, "/api/auth/login")
                    .permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/auth/signup")
                    .permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/auth/signup/company")
                    .permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/auth/verify-email/{email}")
                    .permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/auth/send-reset-password")
                    .permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/auth/verify-reset-token/{email}")
                    .permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/auth/reset-password/{username}")
                    .permitAll()

                    // User endpoints
                    .requestMatchers(HttpMethod.PUT, "/api/user/update/{username}")
                    .authenticated()
                    .requestMatchers(HttpMethod.DELETE, "/api/user/delete/{username}")
                    .authenticated()
                    .requestMatchers(HttpMethod.DELETE, "/api/user/banner/delete/{username}")
                    .authenticated()
                    .requestMatchers(HttpMethod.GET, "/api/user/username/{username}")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/user/id/{id}")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/user/search")
                    .permitAll()

                    // Posts endpoints
                    .requestMatchers(HttpMethod.POST, "/api/posts/create/{userId}")
                    .authenticated()
                    .requestMatchers(HttpMethod.PUT, "/api/posts/update/{userId}/{postId}")
                    .authenticated()
                    .requestMatchers(HttpMethod.GET, "/api/posts/get/{postId}")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/posts/get")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/posts/get/user/{userId}")
                    .permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/posts/repost/{userId}/{postId}")
                    .authenticated()
                    .requestMatchers(HttpMethod.DELETE, "/api/posts/delete/{userId}/{postId}")
                    .authenticated()

                    // Likes endpoints
                    .requestMatchers(HttpMethod.POST, "/api/likes/toggleLike/{userId}/{postId}")
                    .authenticated()
                    .requestMatchers(
                        HttpMethod.POST, "/api/likes/toggleLikeComment/{userId}/{commentId}")
                    .authenticated()
                    .requestMatchers(HttpMethod.GET, "/api/likes/get/{userId}")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/likes/get/{userId}/page")
                    .permitAll()

                    // Comments endpoints
                    .requestMatchers(HttpMethod.POST, "/api/comment/create")
                    .authenticated()
                    .requestMatchers(HttpMethod.GET, "/api/comment/get")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/comment/get/**")
                    .permitAll()
                    .requestMatchers(HttpMethod.PUT, "/api/comment/update/{userId}/{commentId}")
                    .authenticated()
                    .requestMatchers(HttpMethod.DELETE, "/api/comment/delete/{userId}/{commentId}")
                    .authenticated()

                    // Follow endpoints
                    .requestMatchers(HttpMethod.GET, "/api/follow/followers/{userId}")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/follow/followers/{userId}/count")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/follow/following/{userId}")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/follow/following/{userId}/count")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/follow/get/{followerId}/{followedId}")
                    .permitAll()
                    .requestMatchers(
                        HttpMethod.POST, "/api/follow/followAndUnfollow/{followerId}/{followedId}")
                    .authenticated()
                    .requestMatchers(HttpMethod.PUT, "/api/follow/accept/{followerId}/{followedId}")
                    .authenticated()
                    .requestMatchers(
                        HttpMethod.PUT, "/api/follow/decline/{followerId}/{followedId}")
                    .authenticated()

                    // Swagger
                    .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/actuator/health")
                    .permitAll()

                    // Opportunities endpoints
                    .requestMatchers(HttpMethod.POST, "/api/opportunities/create/{userId}")
                    .authenticated()
                    .requestMatchers(
                        HttpMethod.PUT, "/api/opportunities/update/{userId}/{opportunityId}")
                    .authenticated()
                    .requestMatchers(
                        HttpMethod.DELETE, "/api/opportunities/delete/{userId}/{opportunityId}")
                    .authenticated()
                    .requestMatchers(HttpMethod.GET, "/api/opportunities/get/{opportunityId}")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/opportunities/get/company/{companyId}")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/opportunities/get")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/opportunities/skills")
                    .permitAll()

                    // Subscriber endpoints
                    .requestMatchers(
                        HttpMethod.POST,
                        "/api/subscriber/toggleSubscriber/{athleteId}/{opportunityId}")
                    .authenticated()
                    .requestMatchers(HttpMethod.GET, "/api/subscriber/subscribers/{opportunityId}")
                    .authenticated()
                    .requestMatchers(
                        HttpMethod.GET, "/api/subscriber/isSubscribed/{athleteId}/{opportunityId}")
                    .authenticated()
                    .requestMatchers(HttpMethod.GET, "/api/subscriber/athlete/{athleteId}")
                    .authenticated()

                    // Saved opportunities endpoints
                    .requestMatchers(
                        HttpMethod.POST,
                        "/api/saved-opportunities/toggle/{athleteId}/{opportunityId}")
                    .authenticated()
                    .requestMatchers(HttpMethod.GET, "/api/saved-opportunities/athlete/{athleteId}")
                    .authenticated()
                    .requestMatchers(
                        HttpMethod.GET,
                        "/api/saved-opportunities/isSaved/{athleteId}/{opportunityId}")
                    .authenticated()

                    // Notifications endpoints
                    .requestMatchers("/api/notifications/**")
                    .authenticated()

                    // Report endpoints
                    .requestMatchers(HttpMethod.POST, "/api/reports/create/{userId}")
                    .authenticated()
                    .requestMatchers(HttpMethod.GET, "/api/reports/pending")
                    .access(
                        (authentication, context) ->
                            new AuthorizationDecision(hasAdminRole(authentication.get())))
                    .requestMatchers(HttpMethod.GET, "/api/reports/all")
                    .access(
                        (authentication, context) ->
                            new AuthorizationDecision(hasAdminRole(authentication.get())))
                    .requestMatchers(HttpMethod.GET, "/api/reports/status/{status}")
                    .access(
                        (authentication, context) ->
                            new AuthorizationDecision(hasAdminRole(authentication.get())))
                    .requestMatchers(HttpMethod.GET, "/api/reports/count/{entityId}/{type}")
                    .permitAll()

                    // Admin endpoints
                    .requestMatchers("/api/admin/**")
                    .access(
                        (authentication, context) ->
                            new AuthorizationDecision(hasAdminRole(authentication.get())))
                    .requestMatchers(HttpMethod.POST, "/api/messages/upload")
                    .authenticated()
                    .requestMatchers(HttpMethod.PUT, "/api/messages/{messageId}")
                    .authenticated()
                    .requestMatchers(HttpMethod.DELETE, "/api/messages/{messageId}")
                    .authenticated()
                    .requestMatchers("/ws/**")
                    .permitAll()
                    .anyRequest()
                    .authenticated())
        .oauth2ResourceServer(
            oauth2 ->
                oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(new JwtAuthenticationConverter())))
        .sessionManagement(
            session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
    return http.build();
  }

  private boolean hasAdminRole(Authentication authentication) {
    if (authentication == null || !authentication.isAuthenticated()) {
      return false;
    }

    Object roleClaim = null;

    if (authentication instanceof JwtAuthenticationToken jwtAuthenticationToken) {
      roleClaim = jwtAuthenticationToken.getToken().getClaim("role");
    }

    if (roleClaim == null && authentication.getPrincipal() instanceof Jwt jwt) {
      roleClaim = jwt.getClaim("role");
    }

    return containsAdminRole(roleClaim);
  }

  private boolean containsAdminRole(Object roleClaim) {
    if (roleClaim instanceof Collection<?> roles) {
      return roles.stream().anyMatch(this::isAdminRoleEntry);
    }

    return isAdminRoleEntry(roleClaim);
  }

  private boolean isAdminRoleEntry(Object roleEntry) {
    if (roleEntry instanceof Map<?, ?> roleMap) {
      Object roleName = roleMap.get("name");
      return roleName != null && "ADMIN".equalsIgnoreCase(roleName.toString());
    }

    if (roleEntry instanceof String roleName) {
      return "ADMIN".equalsIgnoreCase(roleName)
          || roleName.toUpperCase(Locale.ROOT).contains("ADMIN");
    }

    return false;
  }
}
