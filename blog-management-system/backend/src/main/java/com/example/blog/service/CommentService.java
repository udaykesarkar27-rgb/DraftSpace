package com.example.blog.service;

import com.example.blog.dto.CommentDtos.CommentRequest;
import com.example.blog.dto.CommentDtos.CommentResponse;
import com.example.blog.entity.Comment;
import com.example.blog.entity.Post;
import com.example.blog.entity.User;
import com.example.blog.exception.ResourceNotFoundException;
import com.example.blog.repository.CommentRepository;
import com.example.blog.repository.PostRepository;
import com.example.blog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<CommentResponse> list(Long postId) {
        if (!postRepository.existsById(postId)) {
            throw new ResourceNotFoundException("Post", postId);
        }
        return commentRepository.findByPostIdOrderByCreatedAtAsc(postId).stream().map(CommentService::toResponse).toList();
    }

    @Transactional
    public CommentResponse add(Long postId, CommentRequest req, String username) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new ResourceNotFoundException("Post", postId));
        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", username));
        Comment c = new Comment();
        c.setPost(post);
        c.setAuthor(author);
        c.setContent(req.content().trim());
        return toResponse(commentRepository.save(c));
    }

    @Transactional
    public void delete(Long commentId, String username, boolean isAdmin) {
        Comment c = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", commentId));
        if (!isAdmin && !c.getAuthor().getUsername().equals(username)) {
            throw new AccessDeniedException("Only the author or an admin can delete this comment");
        }
        commentRepository.delete(c);
    }

    public static CommentResponse toResponse(Comment c) {
        return new CommentResponse(c.getId(), c.getContent(), c.getPost().getId(), c.getPost().getTitle(),
                c.getAuthor().getId(), c.getAuthor().getUsername(), c.getCreatedAt());
    }
}
