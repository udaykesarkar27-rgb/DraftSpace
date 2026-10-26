package com.example.blog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public final class PostDtos {
    private PostDtos() {}

    public record PostRequest(
            @NotBlank @Size(max = 200) String title,
            @NotBlank @Size(max = 50_000) String content,
            @NotBlank @Size(max = 50) String category) {}

    /** {@code content} is null in list responses; use {@code excerpt} there. */
    public record PostResponse(
            Long id, String title, String content, String excerpt, String category,
            Long authorId, String authorUsername,
            Instant createdAt, Instant updatedAt,
            long commentCount, int readTimeMinutes,

            // Added fields for the Like feature
            int likeCount,
            boolean likedByCurrentUser) {}
}