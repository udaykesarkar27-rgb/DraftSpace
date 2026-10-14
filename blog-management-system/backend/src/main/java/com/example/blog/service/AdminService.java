package com.example.blog.service;

import com.example.blog.dto.AdminDtos.MetricsResponse;
import com.example.blog.dto.CommentDtos.CommentResponse;
import com.example.blog.dto.PageResponse;
import com.example.blog.dto.UserResponse;
import com.example.blog.entity.Role;
import com.example.blog.entity.User;
import com.example.blog.exception.BadRequestException;
import com.example.blog.exception.ResourceNotFoundException;
import com.example.blog.repository.CommentRepository;
import com.example.blog.repository.PostRepository;
import com.example.blog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumSet;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;

    @Transactional(readOnly = true)
    public MetricsResponse metrics() {
        Map<String, Long> byCategory = new LinkedHashMap<>();
        postRepository.countGroupedByCategory().forEach(r -> byCategory.put((String) r[0], (Long) r[1]));
        return new MetricsResponse(userRepository.count(), postRepository.count(), commentRepository.count(),
                userRepository.countByRole(Role.ROLE_ADMIN), userRepository.countByEnabledFalse(), byCategory);
    }

    @Transactional(readOnly = true)
    public PageResponse<UserResponse> users(int page, int size) {
        var pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), Sort.by("id"));
        return PageResponse.from(userRepository.findAll(pageable).map(UserResponse::from));
    }

    @Transactional
    public UserResponse updateRoles(Long id, Set<Role> requested, String currentUsername) {
        User user = find(id);
        if (user.getUsername().equals(currentUsername)) {
            throw new BadRequestException("You cannot change your own roles");
        }
        Set<Role> roles = EnumSet.of(Role.ROLE_USER);   // every account keeps ROLE_USER
        roles.addAll(requested);
        user.setRoles(roles);
        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public UserResponse setEnabled(Long id, boolean enabled, String currentUsername) {
        User user = find(id);
        if (user.getUsername().equals(currentUsername)) {
            throw new BadRequestException("You cannot disable your own account");
        }
        user.setEnabled(enabled);
        return UserResponse.from(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public PageResponse<CommentResponse> comments(int page, int size) {
        var pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100),
                Sort.by(Sort.Direction.DESC, "createdAt"));
        return PageResponse.from(commentRepository.findAll(pageable).map(CommentService::toResponse));
    }

    private User find(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User", id));
    }
}
