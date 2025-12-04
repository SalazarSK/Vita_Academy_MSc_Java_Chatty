package com.tech.api.repository;

import com.tech.api.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, String> {

    List<Message> findByRoomIdOrderBySentAtAsc(String roomId);

    List<Message> findByRoomIdAndTagsNameOrderBySentAtAsc(String roomId, String tagName);
}


