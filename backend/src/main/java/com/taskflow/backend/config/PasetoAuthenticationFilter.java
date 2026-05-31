package com.taskflow.backend.config;

import dev.paseto.jpaseto.Paseto;
import dev.paseto.jpaseto.PasetoParser;
import dev.paseto.jpaseto.Pasetos;
import dev.paseto.jpaseto.lang.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.util.ArrayList;

@Component
public class PasetoAuthenticationFilter extends OncePerRequestFilter {

    @Value("${paseto.secret.key}")
    private String secretKeyString;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        SecretKey secretKey = Keys.secretKey(secretKeyString.getBytes());
        String token = null;

        // 1. Look for the AUTH_TOKEN cookie in the request
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("AUTH_TOKEN".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }

        // 2. If the cookie exists, decrypt the token
        if (token != null) {
            try {
                PasetoParser parser = Pasetos.parserBuilder()
                        .setSharedSecret(secretKey)
                        .build();

                Paseto result = parser.parse(token);
                String username = result.getClaims().getSubject(); // Extract the username we saved earlier

                // 3. Tell Spring Security: "This user is valid and authenticated!"
                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                            username, null, new ArrayList<>());
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            } catch (Exception e) {
                // If token is forged, expired, or invalid, it fails silently and the user remains unauthenticated
            }
        }

        // Continue processing the request
        filterChain.doFilter(request, response);
    }
}