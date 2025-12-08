package com.tech.api.service;

import com.tech.api.entity.ChatRoom;
import com.tech.api.entity.User;
import com.tech.api.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatRoomService {

    private final ChatRoomRepository chatRoomRepository;
    private final UserService userService;

    public ChatRoom getById(String id) {
        return chatRoomRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Chat room not found: " + id));
    }

    public ChatRoom createTeamRoom(String name, String creatorId, List<String> memberIds) {
        Set<String> ids = new HashSet<>(memberIds != null ? memberIds : List.of());
        ids.add(creatorId); // creator je vždy člen

        Set<User> members = ids.stream()
                .map(userService::getById)
                .collect(Collectors.toSet());

        ChatRoom room = new ChatRoom();
        room.setName(name);
        room.setDirect(false);
        room.setDirectKey(null);
        room.setMembers(members);

        return chatRoomRepository.save(room);
    }

    public List<ChatRoom> getRoomsForUser(String userId) {
        return chatRoomRepository.findByMembers_Id(userId);
    }

    public ChatRoom getOrCreateDirectRoom(String userAId, String userBId) {
        String key = buildDirectKey(userAId, userBId);

        return chatRoomRepository.findByDirectKey(key)
                .orElseGet(() -> {
                    User u1 = userService.getById(userAId);
                    User u2 = userService.getById(userBId);

                    ChatRoom room = new ChatRoom();
                    room.setName(u1.getUsername() + " ↔ " + u2.getUsername());
                    room.setDirect(true);
                    room.setDirectKey(key);
                    room.setMembers(Set.of(u1, u2));

                    return chatRoomRepository.save(room);
                });
    }

    private String buildDirectKey(String a, String b) {
        return a.compareTo(b) < 0 ? a + "_" + b : b + "_" + a;
    }
}
