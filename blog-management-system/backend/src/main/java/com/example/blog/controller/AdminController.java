package com.example.blog.controller;

import com.example.blog.config.OpenApiConfig;
import com.example.blog.dto.AdminDtos.*;
import com.example.blog.dto.CommentDtos.CommentResponse;
import com.example.blog.dto.PageResponse;
import com.example.blog.dto.UserResponse;
import com.example.blog.service.AdminService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = OpenApiConfig.BEARER)
@Tag(name = "Admin")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/metrics")
    public MetricsResponse metrics() {
        return adminService.metrics();
    }

    @GetMapping("/users")
    public PageResponse<UserResponse> users(@RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "10") int size) {
        return adminService.users(page, size);
    }

    @PutMapping("/users/{id}/roles")
    public UserResponse updateRoles(@PathVariable Long id, @Valid @RequestBody UpdateRolesRequest req,
                                    Authentication auth) {
        return adminService.updateRoles(id, req.roles(), auth.getName());
    }

    @PatchMapping("/users/{id}/enabled")
    public UserResponse setEnabled(@PathVariable Long id, @RequestBody UpdateEnabledRequest req,
                                   Authentication auth) {
        return adminService.setEnabled(id, req.enabled(), auth.getName());
    }

    @GetMapping("/comments")
    public PageResponse<CommentResponse> comments(@RequestParam(defaultValue = "0") int page,
                                                  @RequestParam(defaultValue = "10") int size) {
        return adminService.comments(page, size);
    }
}
