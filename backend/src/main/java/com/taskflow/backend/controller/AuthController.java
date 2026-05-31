package com.taskflow.backend.controller;

import java.security.Principal;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity; // <-- Make sure to add this import
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taskflow.backend.dto.AuthRequest;
import com.taskflow.backend.model.User;
import com.taskflow.backend.repository.UserRepository;

import dev.paseto.jpaseto.Pasetos;
import dev.paseto.jpaseto.lang.Keys;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${paseto.secret.key}")
    private String secretKeyString;

    // FIX 1: Match the environment variable name (IS_PRODUCTION maps to is.production)
    @Value("${is.production:false}") 
    private boolean isProduction;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Username already exists");
        }

        User newUser = new User(request.getUsername(), passwordEncoder.encode(request.getPassword()));
        userRepository.save(newUser);

        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request, HttpServletResponse response) {
        Optional<User> userOptional = userRepository.findByUsername(request.getUsername());

        if (userOptional.isPresent() && passwordEncoder.matches(request.getPassword(), userOptional.get().getPassword())) {

            String token = Pasetos.V2.LOCAL.builder()
                    .setSharedSecret(Keys.secretKey(secretKeyString.getBytes()))
                    .setSubject(request.getUsername())
                    .compact();

            ResponseCookie springCookie = ResponseCookie.from("AUTH_TOKEN", token)
                    .httpOnly(true)
                    .secure(isProduction)
                    .path("/")
                    .maxAge(24 * 60 * 60)
                    .sameSite(isProduction ? "None" : "Lax")
                    .build();

            response.addHeader(HttpHeaders.SET_COOKIE, springCookie.toString());

            return ResponseEntity.ok("Login successful");
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        ResponseCookie deleteCookie = ResponseCookie.from("AUTH_TOKEN", "")
                .httpOnly(true)
                .secure(isProduction)
                .path("/")
                .maxAge(0) 
                .sameSite(isProduction ? "None" : "Lax")
                .build();

        response.setHeader(HttpHeaders.SET_COOKIE, deleteCookie.toString());
        return ResponseEntity.ok("Logged out successfully");
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No active session");
        }

        // FIX 2: Use Map.of() to guarantee valid application/json formatting
        return ResponseEntity.ok(Map.of("username", principal.getName()));
    }
}