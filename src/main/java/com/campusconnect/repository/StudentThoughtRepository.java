package com.campusconnect.repository;

import com.campusconnect.model.StudentThought;
import com.campusconnect.model.User;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentThoughtRepository extends JpaRepository<StudentThought, Long> {
    List<StudentThought> findByCategory(String category, Sort sort);
    List<StudentThought> findByAuthor(User author, Sort sort);
    // findAll will be used with Sort for getting all thoughts
}
