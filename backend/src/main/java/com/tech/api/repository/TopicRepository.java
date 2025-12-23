package com.tech.api.repository;

import com.tech.api.entity.Topic;
import com.tech.api.enums.TopicStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TopicRepository extends JpaRepository<Topic, String> {
    List<Topic> findByRoom_IdOrderByCreatedAtDesc(String roomId);
    List<Topic> findByRoom_IdAndStatusOrderByCreatedAtDesc(String roomId, TopicStatus status);
    Optional<Topic> findByIdAndRoom_Id(String topicId, String roomId);
    long countByRoom_Id(String roomId);

}
