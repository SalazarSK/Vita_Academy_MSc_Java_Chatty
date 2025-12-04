package com.tech.api.controller;

import com.tech.api.entity.ChatRoom;
import com.tech.api.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/rooms")
@RequiredArgsConstructor
public class ChatRoomController {

    private final ChatRoomRepository chatRoomRepository;

    @GetMapping
    public List<ChatRoom> getAllRooms() {
        return chatRoomRepository.findAll();
    }

    @PostMapping
    public ChatRoom createRoom(@RequestBody ChatRoom room) {
        return chatRoomRepository.save(room);
    }
}
