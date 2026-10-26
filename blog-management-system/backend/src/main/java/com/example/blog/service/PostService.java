package com.example.blog.service;

import com.example.blog.dto.PageResponse;
import com.example.blog.dto.PostDtos.PostRequest;
import com.example.blog.dto.PostDtos.PostResponse;
import com.example.blog.entity.Post;
import com.example.blog.entity.User;
import com.example.blog.exception.ResourceNotFoundException;
import com.example.blog.repository.CommentRepository;
import com.example.blog.repository.PostRepository;
import com.example.blog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PostService {

    private static final int MAX_PAGE_SIZE = 50;

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;

    @Transactional(readOnly = true)
    public PageResponse<PostResponse> list(int page, int size, String category, String search) {
        Page<Post> result = postRepository.search(blank(category), blank(search), pageable(page, size));
        return toPage(result);
    }

    @Transactional(readOnly = true)
    public PageResponse<PostResponse> listMine(String username, int page, int size) {
        User user = findUser(username);
        return toPage(postRepository.findByAuthorId(user.getId(), pageable(page, size)));
    }

    @Transactional(readOnly = true)
    public PostResponse get(Long id) {
        Post post = findPost(id);
        return toResponse(post, commentRepository.countByPostId(id), true);
    }

    @Transactional(readOnly = true)
    public List<String> categories() {
        return postRepository.findDistinctCategories();
    }

    @Transactional
    public PostResponse create(PostRequest req, String username) {
        Post post = new Post();
        post.setAuthor(findUser(username));
        apply(post, req);
        return toResponse(postRepository.save(post), 0, true);
    }

    @Transactional
    public PostResponse update(Long id, PostRequest req, String username) {
        Post post = findPost(id);
        if (!post.getAuthor().getUsername().equals(username)) {
            throw new AccessDeniedException("Only the author can edit this post");
        }
        apply(post, req);
        Post saved = postRepository.saveAndFlush(post);
        return toResponse(saved, commentRepository.countByPostId(id), true);
    }

    @Transactional
    public void delete(Long id, String username, boolean isAdmin) {
        Post post = findPost(id);
        if (!isAdmin && !post.getAuthor().getUsername().equals(username)) {
            throw new AccessDeniedException("Only the author or an admin can delete this post");
        }
        postRepository.delete(post);
    }

    // Added toggleLike method
    @Transactional
    public void toggleLike(Long id, String username) {
        Post post = findPost(id);
        User user = findUser(username);

        if (post.getLikedBy().contains(user)) {
            post.getLikedBy().remove(user); // Unlike if already liked
        } else {
            post.getLikedBy().add(user); // Like if not liked
        }
        postRepository.save(post);
    }

    // ---------------------------------------------------------------- helpers

    private void apply(Post post, PostRequest req) {
        post.setTitle(req.title().trim());
        post.setContent(req.content());
        post.setCategory(req.category().trim());
    }

    private Post findPost(Long id) {
        return postRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Post", id));
    }

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", username));
    }

    private Pageable pageable(int page, int size) {
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        return PageRequest.of(Math.max(page, 0), safeSize, Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    private String blank(String s) {
        return s == null ? "" : s.trim();
    }

    private PageResponse<PostResponse> toPage(Page<Post> page) {
        List<Long> ids = page.getContent().stream().map(Post::getId).toList();
        Map<Long, Long> counts = new HashMap<>();
        if (!ids.isEmpty()) {
            commentRepository.countGroupedByPostIds(ids)
                    .forEach(row -> counts.put((Long) row[0], (Long) row[1]));
        }
        return PageResponse.from(page.map(p -> toResponse(p, counts.getOrDefault(p.getId(), 0L), false)));
    }

    private PostResponse toResponse(Post p, long commentCount, boolean includeContent) {
        String content = p.getContent();

        // Calculate likes and check if the current user has liked it
        int likeCount = p.getLikedBy().size();
        boolean likedByCurrentUser = false;

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
            String currentUsername = auth.getName();
            likedByCurrentUser = p.getLikedBy().stream()
                    .anyMatch(u -> u.getUsername().equals(currentUsername));
        }

        return new PostResponse(
                p.getId(), p.getTitle(), includeContent ? content : null, excerpt(content),
                p.getCategory(), p.getAuthor().getId(), p.getAuthor().getUsername(),
                p.getCreatedAt(), p.getUpdatedAt(), commentCount, readTime(content),
                likeCount, likedByCurrentUser
        );
    }

    private int readTime(String content) {
        String trimmed = content.trim();
        int words = trimmed.isEmpty() ? 0 : trimmed.split("\\s+").length;
        return Math.max(1, (int) Math.ceil(words / 200.0));
    }

    private String excerpt(String content) {
        String plain = content.replaceAll("[#*_`>\\[\\]()!-]+", " ").replaceAll("\\s+", " ").trim();
        return plain.length() <= 220 ? plain : plain.substring(0, 220).trim() + "…";
    }
}