package com.tech.api.controller;

import com.tech.api.dto.ChatRoomDto;
import com.tech.api.dto.CreateRoomRequest;
import com.tech.api.entity.ChatRoom;
import com.tech.api.service.ChatRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/rooms")
@RequiredArgsConstructor
public class ChatRoomController {

    private final ChatRoomService chatRoomService;

    @GetMapping
    public List<ChatRoomDto> getRooms(@RequestParam String userId) {
        return chatRoomService.getRoomsForUser(userId)
                .stream()
                .map(r -> new ChatRoomDto(r.getId(), r.getName(), r.isDirect()))
                .toList();
    }

    @PostMapping
    public ChatRoomDto createRoom(@RequestBody CreateRoomRequest req) {
        ChatRoom room = chatRoomService.createTeamRoom(
                req.name(),
                req.creatorId(),
                req.memberIds()
        );
        return new ChatRoomDto(room.getId(), room.getName(), room.isDirect());
    }

    @GetMapping("/private")
    public ChatRoomDto getOrCreateDirectRoom(
            @RequestParam String userId,
            @RequestParam String otherId
    ) {
        ChatRoom room = chatRoomService.getOrCreateDirectRoom(userId, otherId);
        return new ChatRoomDto(room.getId(), room.getName(), room.isDirect());
    }
}
