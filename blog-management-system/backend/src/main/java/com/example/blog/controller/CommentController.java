package com.example.blog.controller;

import com.example.blog.config.OpenApiConfig;
import com.example.blog.dto.CommentDtos.CommentRequest;
import com.example.blog.dto.CommentDtos.CommentResponse;
import com.example.blog.security.SecurityUtils;
import com.example.blog.service.CommentService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Comments")
public class CommentController {

    private final CommentService commentService;

    @GetMapping("/posts/{postId}/comments")
    public List<CommentResponse> list(@PathVariable Long postId) {
        return commentService.list(postId);
    }

    @PostMapping("/posts/{postId}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    @SecurityRequirement(name = OpenApiConfig.BEARER)
    public CommentResponse add(@PathVariable Long postId, @Valid @RequestBody CommentRequest req, Authentication auth) {
        return commentService.add(postId, req, auth.getName());
    }

    @DeleteMapping("/comments/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @SecurityRequirement(name = OpenApiConfig.BEARER)
    public void delete(@PathVariable Long id, Authentication auth) {
        commentService.delete(id, auth.getName(), SecurityUtils.isAdmin(auth));
    }
}
