package com.campusconnect.service;

import com.campusconnect.dto.StudentThoughtRequest;
import com.campusconnect.dto.StudentThoughtResponse;
import com.campusconnect.model.StudentThought;
import com.campusconnect.model.User;
import com.campusconnect.repository.StudentThoughtRepository;
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
public class StudentThoughtService {

    @Autowired
    private StudentThoughtRepository studentThoughtRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public StudentThoughtResponse createThought(StudentThoughtRequest request, String username) {
        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

        if (!"STUDENT".equalsIgnoreCase(author.getRole())) {
            throw new UnauthorizedException("User " + username + " is not authorized to share thoughts. Role must be STUDENT.");
        }

        StudentThought thought = new StudentThought(
            author,
            request.getTitle(),
            request.getContent(),
            request.getCategory(),
            request.isAnonymous()
        );
        StudentThought savedThought = studentThoughtRepository.save(thought);
        return new StudentThoughtResponse(savedThought);
    }

    @Transactional(readOnly = true)
    public List<StudentThoughtResponse> getAllThoughts() {
        List<StudentThought> thoughts = studentThoughtRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        return thoughts.stream()
                .map(StudentThoughtResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<StudentThoughtResponse> getThoughtsByCategory(String category) {
        List<StudentThought> thoughts = studentThoughtRepository.findByCategory(category, Sort.by(Sort.Direction.DESC, "createdAt"));
        return thoughts.stream()
                .map(StudentThoughtResponse::new)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<StudentThoughtResponse> getThoughtsByAuthor(String username) {
        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
        List<StudentThought> thoughts = studentThoughtRepository.findByAuthor(author, Sort.by(Sort.Direction.DESC, "createdAt"));
        return thoughts.stream()
                .map(StudentThoughtResponse::new)
                .collect(Collectors.toList());
    }


    @Transactional
    public void deleteThought(Long thoughtId, String username) {
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

        StudentThought thought = studentThoughtRepository.findById(thoughtId)
                .orElseThrow(() -> new ResourceNotFoundException("Thought not found with id: " + thoughtId));

        // Check if the current user is the author AND the thought is not anonymous
        // If thought is anonymous, it cannot be deleted by its original author through this check
        // A different policy might be needed for anonymous thoughts (e.g. admin deletion only)
        if (thought.isAnonymous()) {
            throw new UnauthorizedException("Anonymous thoughts cannot be deleted by authors.");
        }
        
        if (!thought.getAuthor().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("User " + username + " is not authorized to delete this thought.");
        }
        
        // Ensure student role for deletion as well, though author check is primary
        if (!"STUDENT".equalsIgnoreCase(currentUser.getRole())) {
             throw new UnauthorizedException("User " + username + " is not authorized. Role must be STUDENT.");
        }


        studentThoughtRepository.delete(thought);
    }
}
