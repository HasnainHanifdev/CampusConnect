package com.campusconnect.service;

import com.campusconnect.dto.PostRequest;
import com.campusconnect.dto.PostResponse;
import com.campusconnect.model.Post;
import com.campusconnect.model.User;
import com.campusconnect.repository.PostRepository;
import com.campusconnect.repository.UserRepository;
import com.campusconnect.exception.ResourceNotFoundException; // Custom exception (to be created)
import com.campusconnect.exception.UnauthorizedException; // Custom exception (to be created)

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public PostResponse createPost(String username, PostRequest postRequest) {
        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

        Post post = new Post(author, postRequest.getContent());
        Post savedPost = postRepository.save(post);
        return new PostResponse(savedPost);
    }

    @Transactional(readOnly = true)
    public List<PostResponse> getAllPosts() {
        // Fetch posts and their authors with profiles in a more optimized way if possible
        // This might still cause N+1 if profiles are lazy and accessed in PostResponse constructor
        // For now, using default findAll and relying on PostResponse to handle profile access.
        List<Post> posts = postRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        return posts.stream()
                .map(PostResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PostResponse getPostById(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));
        return new PostResponse(post);
    }

    @Transactional
    public PostResponse updatePost(Long postId, String username, PostRequest postRequest) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));

        if (!post.getAuthor().getUsername().equals(username)) {
            throw new UnauthorizedException("User not authorized to update this post.");
        }

        post.setContent(postRequest.getContent());
        Post updatedPost = postRepository.save(post);
        return new PostResponse(updatedPost);
    }

    @Transactional
    public void deletePost(Long postId, String username) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));

        if (!post.getAuthor().getUsername().equals(username)) {
            throw new UnauthorizedException("User not authorized to delete this post.");
        }

        postRepository.delete(post);
    }
}
