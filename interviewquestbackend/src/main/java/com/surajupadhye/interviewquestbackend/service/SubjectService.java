package com.surajupadhye.interviewquestbackend.service;

import com.surajupadhye.interviewquestbackend.entity.Subject;
import com.surajupadhye.interviewquestbackend.entity.SyllabusTopic;
import java.util.List;

public interface SubjectService {
    List<Subject> getAllSubjects();
    List<Subject> getSubjectsForLandingPage();
    Subject getSubjectById(Long id);
    Subject getSubjectBySlug(String slug);
    Subject createSubject(Subject subject);
    Subject updateSubject(Long id, Subject subject);
    void deleteSubject(Long id);

    List<SyllabusTopic> getTopicsBySubjectId(Long subjectId);
    SyllabusTopic getTopicBySubjectAndTopicSlug(String subjectSlug, String topicSlug);
    SyllabusTopic createTopic(Long subjectId, SyllabusTopic topic);
    SyllabusTopic updateTopic(Long id, SyllabusTopic topic);
    void deleteTopic(Long id);
    void renameChapter(Long subjectId, String oldName, String newName);
    void deleteChapter(Long subjectId, String chapterName);
    String generateTopicContent(String prompt, String userApiKey);
}
