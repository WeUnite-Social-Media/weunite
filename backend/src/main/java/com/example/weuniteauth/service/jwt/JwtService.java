package com.example.weuniteauth.service.jwt;

import com.example.weuniteauth.domain.users.User;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class JwtService {

    private final JwtEncoder jwtEncoder;
    private final JwtDecoder jwtDecoder;

    private static final Long DEFAULT_TOKEN_EXPIRATION_MILLIS = 15 * 24 * 60 * 60 * 1000L;

    public JwtService(JwtEncoder jwtEncoder, JwtDecoder jwtDecoder) {
        this.jwtEncoder = jwtEncoder;
        this.jwtDecoder = jwtDecoder;
    }

    public String generateToken(User user) {
        return generateToken(user, DEFAULT_TOKEN_EXPIRATION_MILLIS);
    }

    public String generateToken(User user, Long expirationInMillis) {
        Instant now = Instant.now();

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("weunite")
                .subject(user.getUsername())
                .claims(userClaims -> {
                    userClaims.put("role", user.getRole());
                    userClaims.put("id", user.getId().toString());
                })
                .issuedAt(now)
                .expiresAt(now.plusMillis(expirationInMillis))
                .build();

        return jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
    }

    public Long getDefaultTokenExpirationTime() {
        return DEFAULT_TOKEN_EXPIRATION_MILLIS;
    }
}
