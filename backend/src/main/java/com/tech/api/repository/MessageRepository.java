package com.tech.api.repository;

import com.tech.api.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, String> {
    List<Message> findByFrom_IdAndTo_IdOrFrom_IdAndTo_Id(
            String fromId, String toId,
            String toId2, String fromId2
    );
}

