package com.tech.api.repository;

import com.tech.api.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, String> {
    Optional<ChatRoom> findByName(String name);
    Optional<ChatRoom> findByDirectKey(String directKey);
    List<ChatRoom> findByMembers_Id(String userId);
}
