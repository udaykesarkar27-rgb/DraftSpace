package com.example.blog.service;

import com.example.blog.dto.AuthDtos.*;
import com.example.blog.dto.UserResponse;
import com.example.blog.entity.Role;
import com.example.blog.entity.User;
import com.example.blog.exception.ConflictException;
import com.example.blog.repository.UserRepository;
import com.example.blog.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByUsername(req.username())) {
            throw new ConflictException("Username is already taken");
        }
        if (userRepository.existsByEmail(req.email())) {
            throw new ConflictException("Email is already registered");
        }
        User user = new User();
        user.setUsername(req.username());
        user.setEmail(req.email().toLowerCase());
        user.setPassword(passwordEncoder.encode(req.password()));
        user.setRoles(Set.of(Role.ROLE_USER));
        user = userRepository.save(user);
        return toResponse(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        // Throws BadCredentialsException / DisabledException, mapped by GlobalExceptionHandler.
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.identifier(), req.password()));
        User user = userRepository.findByUsernameOrEmail(req.identifier(), req.identifier()).orElseThrow();
        return toResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse me(String username) {
        return UserResponse.from(userRepository.findByUsername(username).orElseThrow());
    }

    private AuthResponse toResponse(User user) {
        return new AuthResponse(jwtUtils.generateToken(user.getUsername()), "Bearer",
                jwtUtils.getExpirationMs(), UserResponse.from(user));
    }
}
