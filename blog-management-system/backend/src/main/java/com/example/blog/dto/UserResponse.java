package com.example.blog.dto;

import com.example.blog.entity.Role;
import com.example.blog.entity.User;

import java.time.Instant;
import java.util.Set;
import java.util.stream.Collectors;

public record UserResponse(Long id, String username, String email, Set<String> roles, boolean enabled, Instant createdAt) {
    public static UserResponse from(User u) {
        return new UserResponse(u.getId(), u.getUsername(), u.getEmail(),
                u.getRoles().stream().map(Role::name).collect(Collectors.toSet()),
                u.isEnabled(), u.getCreatedAt());
    }
}
