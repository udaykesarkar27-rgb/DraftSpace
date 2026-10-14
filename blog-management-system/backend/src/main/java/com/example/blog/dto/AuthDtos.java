package com.example.blog.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public final class AuthDtos {
    private AuthDtos() {}

    public record RegisterRequest(
            @NotBlank @Size(min = 3, max = 50)
            @Pattern(regexp = "^[A-Za-z0-9_.-]+$", message = "may only contain letters, digits, '.', '_' and '-'")
            String username,
            @NotBlank @Email @Size(max = 120) String email,
            @NotBlank @Size(min = 6, max = 100) String password) {}

    /** {@code identifier} may be either the username or the email. */
    public record LoginRequest(@NotBlank String identifier, @NotBlank String password) {}

    public record AuthResponse(String token, String tokenType, long expiresInMs, UserResponse user) {}
}
