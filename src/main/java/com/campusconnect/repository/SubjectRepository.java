package com.campusconnect.repository;

import com.campusconnect.model.Subject;
import com.campusconnect.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    Optional<Subject> findByName(String name);
    List<Subject> findByTeacher(User teacher);
    List<Subject> findByTeacherUsername(String teacherUsername); // Convenience method
}
