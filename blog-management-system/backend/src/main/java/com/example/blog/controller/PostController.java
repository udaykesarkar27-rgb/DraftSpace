package com.example.blog.controller;

import com.example.blog.config.OpenApiConfig;
import com.example.blog.dto.PageResponse;
import com.example.blog.dto.PostDtos.PostRequest;
import com.example.blog.dto.PostDtos.PostResponse;
import com.example.blog.security.SecurityUtils;
import com.example.blog.service.PostService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@Tag(name = "Posts")
public class PostController {

    private final PostService postService;

    @GetMapping
    public PageResponse<PostResponse> list(@RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "9") int size,
                                           @RequestParam(required = false) String category,
                                           @RequestParam(required = false) String search) {
        return postService.list(page, size, category, search);
    }

    @GetMapping("/categories")
    public List<String> categories() {
        return postService.categories();
    }

    @GetMapping("/mine")
    @SecurityRequirement(name = OpenApiConfig.BEARER)
    public PageResponse<PostResponse> mine(Authentication auth,
                                           @RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "10") int size) {
        String username = getUsernameOrThrow(auth);
        return postService.listMine(username, page, size);
    }

    @GetMapping("/{id}")
    public PostResponse get(@PathVariable Long id) {
        return postService.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @SecurityRequirement(name = OpenApiConfig.BEARER)
    public PostResponse create(@Valid @RequestBody PostRequest req, Authentication auth) {
        String username = getUsernameOrThrow(auth);
        return postService.create(req, username);
    }

    @PutMapping("/{id}")
    @SecurityRequirement(name = OpenApiConfig.BEARER)
    public PostResponse update(@PathVariable Long id, @Valid @RequestBody PostRequest req, Authentication auth) {
        String username = getUsernameOrThrow(auth);
        return postService.update(id, req, username);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @SecurityRequirement(name = OpenApiConfig.BEARER)
    public void delete(@PathVariable Long id, Authentication auth) {
        String username = getUsernameOrThrow(auth);
        postService.delete(id, username, SecurityUtils.isAdmin(auth));
    }

    // Added Like Endpoint
    @PostMapping("/{id}/like")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @SecurityRequirement(name = OpenApiConfig.BEARER)
    public void toggleLike(@PathVariable Long id, Authentication auth) {
        String username = getUsernameOrThrow(auth);
        postService.toggleLike(id, username);
    }

    private String getUsernameOrThrow(Authentication auth) {
        Authentication currentAuth = auth != null ? auth : SecurityContextHolder.getContext().getAuthentication();

        if (currentAuth == null || !currentAuth.isAuthenticated() || "anonymousUser".equals(currentAuth.getPrincipal())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User is not authenticated");
        }

        Object principal = currentAuth.getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        }

        return currentAuth.getName();
    }
}