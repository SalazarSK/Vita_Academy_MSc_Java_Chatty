package com.tech.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tech.api.dto.MessageDto;
import com.tech.api.dto.SendMessageRequest;
import com.tech.api.security.JwtService;
import com.tech.api.service.MessageService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Set;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(MessageController.class)
@AutoConfigureMockMvc(addFilters = false)
class MessageControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean JwtService jwtService;

    @MockBean MessageService messageService;

    private MessageDto msg(String id) {
        return new MessageDto(
                id,
                "u1",
                "room1",
                "hello",
                ZonedDateTime.now(),
                Set.of("tag1"),
                "topic1"
        );
    }


    @Test
    void getMessages_shouldCallDefault_whenNoFilters() throws Exception {
        when(messageService.getMessagesForRoom("room1", "u1"))
                .thenReturn(List.of(msg("m1")));

        mockMvc.perform(get("/rooms/room1/messages")
                        .param("userId", "u1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("m1"));
    }

    @Test
    void getMessages_shouldFilterByTopic_whenTopicIdPresent() throws Exception {
        when(messageService.getMessagesForRoomByTopic("room1", "topic9", "u1"))
                .thenReturn(List.of(msg("m2")));

        mockMvc.perform(get("/rooms/room1/messages")
                        .param("userId", "u1")
                        .param("topicId", "topic9"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("m2"));
    }

    @Test
    void getMessages_shouldFilterByTag_whenTagPresent() throws Exception {
        when(messageService.getMessagesForRoomByTag("room1", "bug", "u1"))
                .thenReturn(List.of(msg("m3")));

        mockMvc.perform(get("/rooms/room1/messages")
                        .param("userId", "u1")
                        .param("tag", "bug"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("m3"));
    }

    @Test
    void getMessages_shouldSearch_whenQPresent() throws Exception {
        when(messageService.searchMessagesInRoom("room1", "hello", "u1"))
                .thenReturn(List.of(msg("m4")));

        mockMvc.perform(get("/rooms/room1/messages")
                        .param("userId", "u1")
                        .param("q", "hello"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("m4"));
    }

    @Test
    void sendMessage_shouldUseRoomIdFromPath() throws Exception {
        SendMessageRequest reqBody = new SendMessageRequest(
                "WRONG_ROOM",
                "u1",
                "content",
                List.of("tag1"),
                "t1"
        );

        MessageDto saved = msg("m10");
        when(messageService.sendMessage(any(SendMessageRequest.class))).thenReturn(saved);

        mockMvc.perform(post("/rooms/room1/messages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqBody)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("m10"));
    }
}
