package com.tech.api.controller;

import com.tech.api.dto.MessageDto;
import com.tech.api.dto.SendMessageRequest;
import com.tech.api.security.JwtService;
import com.tech.api.service.MessageService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Set;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc(addFilters = false)
class ChatWebSocketControllerTest {

    @Mock MessageService messageService;
    @Mock SimpMessagingTemplate messagingTemplate;
    @MockBean JwtService jwtService;

    @InjectMocks ChatWebSocketController controller;

    @Test
    void send_shouldBroadcastToRoomTopic() {
        SendMessageRequest req = new SendMessageRequest(
                "room1",
                "u1",
                "hi",
                List.of("tag1"),
                "topic1"
        );

        MessageDto saved = new MessageDto(
                "m1",
                "u1",
                "room1",
                "hi",
                ZonedDateTime.now(),
                Set.of("tag1"),
                "topic1"
        );

        when(messageService.sendMessage(req)).thenReturn(saved);

        controller.send(req);

        verify(messageService).sendMessage(req);
        verify(messagingTemplate)
                .convertAndSend("/topic/rooms/room1", saved);
    }

}
