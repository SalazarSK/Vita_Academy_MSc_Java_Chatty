package com.tech.api.service;

import com.tech.api.dto.UserStatusDto;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class PresenceService {

    private final SimpMessagingTemplate messagingTemplate;

    private final Map<String, Boolean> onlineUsers = new ConcurrentHashMap<>();

    public void updateStatus(String userId, boolean online) {
        if (online) {
            onlineUsers.put(userId, true);
        } else {
            onlineUsers.remove(userId);
        }

        UserStatusDto dto = new UserStatusDto();
        dto.setUserId(userId);
        dto.setOnline(online);

        messagingTemplate.convertAndSend("/topic/user-status", dto);
    }
}

