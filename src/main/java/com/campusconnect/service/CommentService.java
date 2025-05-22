package com.campusconnect.service;

import com.campusconnect.dto.CommentRequest;
import com.campusconnect.dto.CommentResponse;
import com.campusconnect.model.Comment;
import com.campusconnect.model.Post;
import com.campusconnect.model.User;
import com.campusconnect.repository.CommentRepository;
import com.campusconnect.repository.PostRepository;
import com.campusconnect.repository.UserRepository;
import com.campusconnect.exception.ResourceNotFoundException;
import com.campusconnect.exception.UnauthorizedException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public CommentResponse createComment(Long postId, String username, CommentRequest commentRequest) {
        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));

        Comment comment = new Comment(post, author, commentRequest.getContent());
        Comment savedComment = commentRepository.save(comment);
        return new CommentResponse(savedComment);
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsByPostId(Long postId) {
        if (!postRepository.existsById(postId)) {
            throw new ResourceNotFoundException("Post not found with id: " + postId);
        }
        List<Comment> comments = commentRepository.findByPostId(postId, Sort.by(Sort.Direction.ASC, "createdAt"));
        return comments.stream()
                .map(CommentResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteComment(Long commentId, String username) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        if (!comment.getAuthor().getUsername().equals(username)) {
            throw new UnauthorizedException("User not authorized to delete this comment.");
        }

        commentRepository.delete(comment);
    }
}
