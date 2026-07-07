package com.surajupadhye.interviewquestbackend.repository;

import com.surajupadhye.interviewquestbackend.entity.UserApiKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserApiKeyRepository extends JpaRepository<UserApiKey, Long> {
    Optional<UserApiKey> findByUserId(Long userId);
    void deleteByUserId(Long userId);
}
