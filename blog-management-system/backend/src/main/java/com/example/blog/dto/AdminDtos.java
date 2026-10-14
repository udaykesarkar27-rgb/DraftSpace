package com.example.blog.dto;

import com.example.blog.entity.Role;
import jakarta.validation.constraints.NotEmpty;

import java.util.Map;
import java.util.Set;

public final class AdminDtos {
    private AdminDtos() {}

    public record MetricsResponse(long totalUsers, long totalPosts, long totalComments,
                                  long adminUsers, long disabledUsers,
                                  Map<String, Long> postsByCategory) {}

    public record UpdateRolesRequest(@NotEmpty Set<Role> roles) {}

    public record UpdateEnabledRequest(boolean enabled) {}
}
