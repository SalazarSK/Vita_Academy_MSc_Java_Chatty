package com.tech.api.repository;

import com.tech.api.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, String> {
    List<Message> findByRoom_IdAndTopicIsNullOrderBySentAtAsc(String roomId);
    List<Message> findByRoom_IdAndTopic_IdOrderBySentAtAsc(String roomId, String topicId);
    List<Message> findByRoom_IdAndTopicIsNullAndTags_NameOrderBySentAtAsc(String roomId, String tagName);
    List<Message> findByRoom_IdAndContentContainingIgnoreCaseOrderBySentAtAsc(String roomId, String q);

}


