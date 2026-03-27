package com.nexorcrm.backend.config;

import com.nexorcrm.backend.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtUtil {

    private static final long ACCESS_TOKEN_EXPIRY_MILLIS = 15 * 60 * 1000;
    private static final Logger log = LoggerFactory.getLogger(JwtUtil.class);

    @Value("${security.jwt.secret}")
    private String secret;

    private SecretKey secretKey;

    @PostConstruct
    void init() {
        if (!StringUtils.hasText(secret)) {
            throw new IllegalStateException("JWT secret is required: security.jwt.secret / JWT_SECRET");
        }
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            throw new IllegalStateException("JWT secret must be at least 256 bits (32 characters)");
        }
        this.secretKey = Keys.hmacShaKeyFor(keyBytes);
        log.info("JwtUtil initialized successfully");
    }

    public String generateAccessToken(User user) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(user.getEmail())
                .claim("userId", user.getId())
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name())
                .claim("forcePasswordChange", user.isForcePasswordChange())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(ACCESS_TOKEN_EXPIRY_MILLIS)))
                .signWith(secretKey)
                .compact();
    }

    public String generateRefreshToken() {
        return UUID.randomUUID().toString();
    }

    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (Exception ex) {
            return false;
        }
    }

    public boolean validateAccessToken(String token) {
        return validateToken(token);
    }

    public Claims extractAllClaims(String token) {
        return parseClaims(token);
    }

    public String extractEmail(String token) {
        return parseClaims(token).get("email", String.class);
    }

    public String extractRole(String token) {
        return parseClaims(token).get("role", String.class);
    }

    public boolean extractForcePasswordChange(String token) {
        Boolean value = parseClaims(token).get("forcePasswordChange", Boolean.class);
        return Boolean.TRUE.equals(value);
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
