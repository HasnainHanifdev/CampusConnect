package com.campusconnect.service;

import com.campusconnect.dto.SubjectRequest;
import com.campusconnect.dto.SubjectResponse;
import com.campusconnect.model.Subject;
import com.campusconnect.model.User;
import com.campusconnect.repository.SubjectRepository;
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
public class SubjectService {

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubjectResourceRepository subjectResourceRepository; // Inject SubjectResourceRepository

    @Transactional
    public SubjectResponse createSubject(SubjectRequest subjectRequest, String teacherUsername) {
        User teacher = userRepository.findByUsername(teacherUsername)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + teacherUsername));

        if (!"TEACHER".equalsIgnoreCase(teacher.getRole())) {
            throw new UnauthorizedException("User " + teacherUsername + " is not authorized to create subjects. Role must be TEACHER.");
        }

        // Check if subject with the same name already exists
        if (subjectRepository.findByName(subjectRequest.getName()).isPresent()) {
            throw new RuntimeException("Error: Subject with name '" + subjectRequest.getName() + "' already exists.");
        }

        Subject subject = new Subject(subjectRequest.getName(), subjectRequest.getDescription(), teacher);
        Subject savedSubject = subjectRepository.save(subject);
        return new SubjectResponse(savedSubject);
    }

    @Transactional(readOnly = true)
    public SubjectResponse getSubjectById(Long subjectId) {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + subjectId));
        return new SubjectResponse(subject);
    }

    @Transactional(readOnly = true)
    public List<SubjectResponse> getAllSubjects() {
        List<Subject> subjects = subjectRepository.findAll(Sort.by(Sort.Direction.ASC, "name"));
        return subjects.stream()
                .map(SubjectResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SubjectResponse> getSubjectsByTeacher(String teacherUsername) {
        User teacher = userRepository.findByUsername(teacherUsername)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + teacherUsername));
        
        // No explicit role check needed here, as we are fetching for a given teacher.
        // If the user is not a teacher, they likely won't have subjects.

        List<Subject> subjects = subjectRepository.findByTeacherUsername(teacherUsername);
        return subjects.stream()
                .map(SubjectResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public SubjectResponse updateSubject(Long subjectId, SubjectRequest subjectRequest, String teacherUsername) {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + subjectId));

        User currentTeacher = userRepository.findByUsername(teacherUsername)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + teacherUsername));

        if (!subject.getTeacher().getId().equals(currentTeacher.getId())) {
            throw new UnauthorizedException("User " + teacherUsername + " is not authorized to update this subject.");
        }
        
        // Ensure the new subject name (if changed) is not already taken by another subject
        if (subjectRequest.getName() != null && !subjectRequest.getName().equalsIgnoreCase(subject.getName())) {
            subjectRepository.findByName(subjectRequest.getName()).ifPresent(existingSubject -> {
                if (!existingSubject.getId().equals(subjectId)) { // If it's a different subject with the same new name
                    throw new RuntimeException("Error: Subject name '" + subjectRequest.getName() + "' is already taken by another subject.");
                }
            });
            subject.setName(subjectRequest.getName());
        }
        
        if (subjectRequest.getDescription() != null) {
            subject.setDescription(subjectRequest.getDescription());
        }
        // Teacher cannot be changed through this method.

        Subject updatedSubject = subjectRepository.save(subject);
        return new SubjectResponse(updatedSubject);
    }

    @Transactional
    public void deleteSubject(Long subjectId, String teacherUsername) {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + subjectId));

        User currentTeacher = userRepository.findByUsername(teacherUsername)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + teacherUsername));

        if (!subject.getTeacher().getId().equals(currentTeacher.getId())) {
            throw new UnauthorizedException("User " + teacherUsername + " is not authorized to delete this subject.");
        }

        subjectRepository.delete(subject);
    }

    @Transactional
    public SubjectResponse updateSubjectDetails(Long subjectId, SubjectDetailUpdateRequest detailRequest, String teacherUsername) {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + subjectId));

        User currentTeacher = userRepository.findByUsername(teacherUsername)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + teacherUsername));

        if (!subject.getTeacher().getId().equals(currentTeacher.getId())) {
            throw new UnauthorizedException("User " + teacherUsername + " is not authorized to update details for this subject.");
        }

        subject.setClassSchedule(detailRequest.getClassSchedule());
        subject.setLectureOutlines(detailRequest.getLectureOutlines());
        subject.setGradingSystem(detailRequest.getGradingSystem());

        Subject updatedSubject = subjectRepository.save(subject);
        return new SubjectResponse(updatedSubject);
    }

    // Methods for managing SubjectResources
    @Transactional
    public SubjectResourceResponse addResourceToSubject(Long subjectId, SubjectResourceRequest resourceRequest, String teacherUsername) {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + subjectId));

        User currentTeacher = userRepository.findByUsername(teacherUsername)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + teacherUsername));

        if (!subject.getTeacher().getId().equals(currentTeacher.getId())) {
            throw new UnauthorizedException("User " + teacherUsername + " is not authorized to add resources to this subject.");
        }

        SubjectResource newResource = new SubjectResource(
            resourceRequest.getTitle(),
            resourceRequest.getLink(),
            resourceRequest.getDescription(),
            subject
        );
        
        // subject.getResources().add(newResource); // Add to collection if managing bi-directionally before save
        // Subject updatedSubject = subjectRepository.save(subject); // If cascading from Subject
        // return new SubjectResourceResponse(updatedSubject.getResources().get(updatedSubject.getResources().size() -1 )); // Find the newly added resource

        // Simpler: save the resource directly
        SubjectResource savedResource = subjectResourceRepository.save(newResource);
        return new SubjectResourceResponse(savedResource);

    }

    @Transactional
    public void deleteResourceFromSubject(Long subjectId, Long resourceId, String teacherUsername) {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + subjectId));
        
        User currentTeacher = userRepository.findByUsername(teacherUsername)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + teacherUsername));

        if (!subject.getTeacher().getId().equals(currentTeacher.getId())) {
            throw new UnauthorizedException("User " + teacherUsername + " is not authorized to delete resources from this subject.");
        }

        SubjectResource resource = subjectResourceRepository.findById(resourceId)
            .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + resourceId));

        if (!resource.getSubject().getId().equals(subjectId)) {
            throw new ResourceNotFoundException("Resource with id " + resourceId + " does not belong to subject " + subjectId);
        }
        
        subjectResourceRepository.delete(resource);
    }

    @Transactional(readOnly = true)
    public List<SubjectResourceResponse> getResourcesForSubject(Long subjectId) {
        if (!subjectRepository.existsById(subjectId)) {
            throw new ResourceNotFoundException("Subject not found with id: " + subjectId);
        }
        List<SubjectResource> resources = subjectResourceRepository.findBySubjectId(subjectId);
        return resources.stream()
            .map(SubjectResourceResponse::new)
            .collect(Collectors.toList());
    }

}
