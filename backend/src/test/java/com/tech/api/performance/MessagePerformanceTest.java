package com.tech.api.performance;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tech.api.configuration.SecurityConfig;
import com.tech.api.controller.MessageController;
import com.tech.api.dto.MessageDto;
import com.tech.api.dto.SendMessageRequest;
import com.tech.api.security.JwtService;
import com.tech.api.service.MessageService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.ZonedDateTime;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(MessageController.class)
@AutoConfigureMockMvc(addFilters = false)
class MessagePerformanceTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @MockBean JwtService jwtService;

    @MockBean private MessageService messageService;

    @Test
    @WithMockUser(username = "perf-tester")
    void sendHundredMessages_underTwoSeconds() throws Exception {
        int count = 100;

        when(messageService.sendMessage(any(SendMessageRequest.class)))
                .thenAnswer(inv -> {
                    SendMessageRequest req = inv.getArgument(0);
                    return new MessageDto(
                            "msg-id",
                            req.fromUserId(),
                            req.roomId(),
                            req.content(),
                            ZonedDateTime.now(),
                            req.tags() == null ? Set.of() : Set.copyOf(req.tags()),
                            req.topicId()
                    );
                });

        long start = System.currentTimeMillis();

        for (int i = 0; i < count; i++) {
            String roomId = "room-1";

            SendMessageRequest req = new SendMessageRequest(
                    roomId,
                    "alice-id",
                    "perf-msg-" + i,
                    null,
                    null
            );

            mockMvc.perform(post("/rooms/{roomId}/messages", roomId)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isOk());
        }

        long durationMs = System.currentTimeMillis() - start;
        System.out.println("sendHundredMessages duration: " + durationMs + " ms");

        assertThat(durationMs).isLessThan(2000);
    }
}
