package com.tech.api.controller;

import com.tech.api.dto.UserStatusDto;
import com.tech.api.service.PresenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class PresenceWebSocketController {

    private final PresenceService presenceService;

    @MessageMapping("/presence.update")
    public void updatePresence(@Payload UserStatusDto status) {
        presenceService.updateStatus(status.getUserId(), status.isOnline());
    }
}
