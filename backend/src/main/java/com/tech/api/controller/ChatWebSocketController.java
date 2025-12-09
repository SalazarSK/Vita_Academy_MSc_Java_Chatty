package com.tech.api.controller;

import com.tech.api.dto.MessageDto;
import com.tech.api.dto.SendMessageRequest;
import com.tech.api.entity.ChatRoom;
import com.tech.api.service.ChatRoomService;
import com.tech.api.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.send")
    public void send(@Payload SendMessageRequest request) {
        MessageDto saved = messageService.sendMessage(request);
        System.out.println(saved);
        messagingTemplate.convertAndSend(
                "/topic/rooms/" + request.roomId(),
                saved
        );
    }
}
