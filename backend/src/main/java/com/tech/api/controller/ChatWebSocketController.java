package com.tech.api.controller;

import com.tech.api.dto.MessageDto;
import com.tech.api.dto.SendMessageRequest;
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

        String userA = saved.fromUserId();
        String userB = saved.toUserId();
        String conversationId = userA.compareTo(userB) < 0
                ? userA + "_" + userB
                : userB + "_" + userA;

        // 3) pošli obom cez topic
        messagingTemplate.convertAndSend("/topic/conversation/" + conversationId, saved);
    }
}
