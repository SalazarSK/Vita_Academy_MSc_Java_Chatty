package com.tech.api.performance;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tech.api.configuration.SecurityConfig;
import com.tech.api.controller.MessageController;
import com.tech.api.dto.MessageDto;
import com.tech.api.dto.SendMessageRequest;
import com.tech.api.service.MessageService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.ZonedDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(MessageController.class)
@Import(SecurityConfig.class)
class MessagePerformanceTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private MessageService messageService;

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
                            req.toUserId(),
                            req.content(),
                            ZonedDateTime.now()
                    );
                });

        long start = System.currentTimeMillis();

        for (int i = 0; i < count; i++) {
            SendMessageRequest req = new SendMessageRequest(
                    "alice-id",
                    "bob-id",
                    "perf-msg-" + i
            );

            mockMvc.perform(post("/messages")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isOk());
        }

        long durationMs = System.currentTimeMillis() - start;
        System.out.println("sendHundredMessages duration: " + durationMs + " ms");

        assertThat(durationMs).isLessThan(2000);
    }
}
