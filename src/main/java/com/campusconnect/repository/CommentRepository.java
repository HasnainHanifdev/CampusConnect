package com.campusconnect.repository;

import com.campusconnect.model.Comment;
import com.campusconnect.model.Post;
import com.campusconnect.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPost(Post post);
    List<Comment> findByAuthor(User author);
    List<Comment> findByPostId(Long postId);
    List<Comment> findByAuthorId(Long authorId);
}
