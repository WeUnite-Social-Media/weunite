package com.example.weuniteauth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authorize -> authorize

                        .requestMatchers("/ws/**").permitAll()
                        .requestMatchers("/ws").permitAll()


                        .requestMatchers("/uploads/**").permitAll()

                        // Auth endpoints
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/signup").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/signup/company").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/verify-email/{email}").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/send-reset-password").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/verify-reset-token/{email}").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/reset-password/{username}").permitAll()

                        // User endpoints
                        .requestMatchers(HttpMethod.PUT, "/api/user/update/{username}").permitAll()
                        .requestMatchers(HttpMethod.DELETE, "/api/user/delete/{username}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/user/username/{username}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/user/id/{id}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/user/search").permitAll()

                        // Posts endpoints
                        .requestMatchers(HttpMethod.POST, "/api/posts/create/{userId}").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/posts/update/{userId}/{postId}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/posts/get/{postId}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/posts/get").permitAll()
                        .requestMatchers(HttpMethod.DELETE, "/api/posts/delete/{userId}/{postId}").permitAll()

                        // Likes endpoints
                        .requestMatchers(HttpMethod.POST, "/api/likes/toggleLike/{userId}/{postId}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/likes/get/{userId}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/likes/get/{userId}/page").permitAll()

                        // Comments endpoints
                        .requestMatchers(HttpMethod.POST, "/api/comment/create").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/comment/get").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/comment/update/{userId}/{commentId}").permitAll()
                        .requestMatchers(HttpMethod.DELETE, "/api/comment/delete/{userId}/{postId}").permitAll()

                        // Follow endpoints
                        .requestMatchers(HttpMethod.GET, "/api/follow/followers/{userId}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/follow/following/{userId}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/follow/get/{followerid}/{followedId}").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/follow/followAndUnfollow/{followerid}/{followedId}").permitAll()

                        // Swagger
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()

                        // Opportunities endpoints
                        .requestMatchers(HttpMethod.POST, "/api/opportunities/create/{userId}").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/opportunities/update/{userId}/{opportunityId}").permitAll()
                        .requestMatchers(HttpMethod.DELETE, "/api/opportunities/delete/{userId}/{opportunityId}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/opportunities/get/{opportunityId}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/opportunities/get/user/{userId}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/opportunities/get").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/reports/create/{userId}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/reports/pending").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/reports/count/{entityId}/{type}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/admin/posts/reported").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/admin/posts/reported/details").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/admin/posts/reported/{postId}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/admin/opportunities/reported").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/admin/opportunities/reported/details").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/admin/opportunities/reported/{opportunityId}").permitAll()
                        .requestMatchers(HttpMethod.DELETE, "/api/admin/posts/{postId}").permitAll()
                        .requestMatchers(HttpMethod.DELETE, "/api/admin/opportunities/{opportunityId}").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/admin/reports/dismiss/{entityId}/{type}").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/admin/reports/review/{entityId}/{type}").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/admin/reports/resolve/{entityId}/{type}").permitAll()
                        .requestMatchers("/ws/**").permitAll()
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt
                                .jwtAuthenticationConverter(new JwtAuthenticationConverter())
                        )
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        return http.build();
    }
}