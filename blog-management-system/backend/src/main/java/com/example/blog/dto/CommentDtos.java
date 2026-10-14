package com.example.blog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public final class CommentDtos {
    private CommentDtos() {}

    public record CommentRequest(@NotBlank @Size(max = 2000) String content) {}

    public record CommentResponse(Long id, String content, Long postId, String postTitle,
                                  Long authorId, String authorUsername, Instant createdAt) {}
}
