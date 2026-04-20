package com.nexorcrm.backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexorcrm.backend.entity.User;
import com.nexorcrm.backend.entity.Vendor;
import com.nexorcrm.backend.repo.UserRepository;
import com.nexorcrm.backend.repo.VendorRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final ObjectMapper objectMapper;

    public JwtFilter(JwtUtil jwtUtil, UserRepository userRepository, VendorRepository vendorRepository, ObjectMapper objectMapper) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.vendorRepository = vendorRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        if (!jwtUtil.validateAccessToken(token)) {
            writeUnauthorized(response, "Invalid or expired access token");
            return;
        }

        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            String tokenType = jwtUtil.extractTokenType(token);
            UsernamePasswordAuthenticationToken authentication;
            if (JwtUtil.TOKEN_TYPE_VENDOR.equalsIgnoreCase(tokenType)) {
                Long vendorId = jwtUtil.extractVendorId(token);
                if (vendorId == null) {
                    writeUnauthorized(response, "Vendor not found for token");
                    return;
                }
                Vendor vendor = vendorRepository.findById(vendorId).orElse(null);
                if (vendor == null || vendor.isDeleted()) {
                    writeUnauthorized(response, "Vendor not found for token");
                    return;
                }
                authentication = new UsernamePasswordAuthenticationToken(
                        vendor.getUsername(),
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_VENDOR"))
                );
            } else {
                String email = jwtUtil.extractEmail(token);
                User user = userRepository.findByEmailAndIsDeletedFalse(email).orElse(null);
                if (user == null) {
                    writeUnauthorized(response, "User not found for token");
                    return;
                }
                authentication = new UsernamePasswordAuthenticationToken(
                        user.getEmail(),
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
                );
            }
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }

    private void writeUnauthorized(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        Map<String, Object> body = Map.of(
                "status", 401,
                "error", "Unauthorized",
                "message", message,
                "timestamp", LocalDateTime.now().toString()
        );
        response.getWriter().write(objectMapper.writeValueAsString(body));
    }
}
