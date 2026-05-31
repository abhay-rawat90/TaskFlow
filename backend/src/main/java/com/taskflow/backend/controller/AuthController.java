package com.taskflow.backend.controller;

import com.taskflow.backend.dto.AuthRequest;
import com.taskflow.backend.model.User;
import com.taskflow.backend.repository.UserRepository;
import dev.paseto.jpaseto.Pasetos;
import dev.paseto.jpaseto.lang.Keys;
import jakarta.servlet.http.HttpServletResponse;
import java.security.Principal;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${paseto.secret.key}")
    private String secretKeyString;

    @Value("${app.is.production}")
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

        // Hash the password before saving
        User newUser = new User(request.getUsername(), passwordEncoder.encode(request.getPassword()));
        userRepository.save(newUser);

        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request, HttpServletResponse response) {
        Optional<User> userOptional = userRepository.findByUsername(request.getUsername());

        // Check if user exists and password matches
        if (userOptional.isPresent() && passwordEncoder.matches(request.getPassword(), userOptional.get().getPassword())) {

            // 1. Generate PASETO Token
            String token = Pasetos.V2.LOCAL.builder()
                    .setSharedSecret(Keys.secretKey(secretKeyString.getBytes()))
                    .setSubject(request.getUsername())
                    .compact();

            // 2. Create the HttpOnly Cookie
            ResponseCookie springCookie = ResponseCookie.from("AUTH_TOKEN", token)
                    .httpOnly(true)
                    .secure(isProduction) // Will be true on Render (HTTPS)
                    .path("/")
                    .maxAge(24 * 60 * 60)
                    .sameSite(isProduction ? "None" : "Lax") // <-- THE CRUCIAL FIX
                    .build();

        
            response.addHeader(HttpHeaders.SET_COOKIE, springCookie.toString());


            return ResponseEntity.ok("Login successful");
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        // Create an identical cookie but set its Max-Age to 0 seconds to instantly destroy it
        ResponseCookie deleteCookie = ResponseCookie.from("AUTH_TOKEN", "")
                .httpOnly(true)
                .secure(isProduction)
                .path("/")
                .maxAge(0) 
                .sameSite(isProduction ? "None" : "Lax") // <-- THE CRUCIAL FIX
                .build();

        response.setHeader(HttpHeaders.SET_COOKIE, deleteCookie.toString());
        return ResponseEntity.ok("Logged out successfully");
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Principal principal) {
        // Since we configured /api/auth/** to be permitAll(), unauthenticated users can hit this route.
        // If the PASETO cookie is valid, the security filter attaches the Principal.
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No active session");
        }

        // Return the username to prove the session is valid
        return ResponseEntity.ok().body("{\"username\": \"" + principal.getName() + "\"}");
    }
}