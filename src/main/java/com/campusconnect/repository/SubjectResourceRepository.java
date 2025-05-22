package com.campusconnect.repository;

import com.campusconnect.model.SubjectResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubjectResourceRepository extends JpaRepository<SubjectResource, Long> {
    List<SubjectResource> findBySubjectId(Long subjectId);
}
