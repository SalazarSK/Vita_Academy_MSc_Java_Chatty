package com.tech.api.service;

import com.tech.api.entity.ChatRoom;
import com.tech.api.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChatRoomService {

    private final ChatRoomRepository chatRoomRepository;

    public ChatRoom getById(String id) {
        return chatRoomRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Chat room not found: " + id));
    }

    public ChatRoom createRoom(String name) {
        ChatRoom room = new ChatRoom();
        room.setName(name);
        return chatRoomRepository.save(room);
    }
}
