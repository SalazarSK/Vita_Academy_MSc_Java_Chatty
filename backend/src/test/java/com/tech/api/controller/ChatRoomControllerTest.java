package com.tech.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tech.api.dto.CreateRoomRequest;
import com.tech.api.entity.ChatRoom;
import com.tech.api.security.JwtService;
import com.tech.api.service.ChatRoomService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ChatRoomController.class)
@AutoConfigureMockMvc(addFilters = false)
class ChatRoomControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockBean ChatRoomService chatRoomService;

    @MockBean JwtService jwtService;

    @Test
    void getRooms_shouldReturnList() throws Exception {
        ChatRoom r1 = new ChatRoom();
        r1.setId("r1");
        r1.setName("Team A");
        r1.setDirect(false);

        ChatRoom r2 = new ChatRoom();
        r2.setId("r2");
        r2.setName("u1_u2");
        r2.setDirect(true);

        when(chatRoomService.getRoomsForUser("u1")).thenReturn(List.of(r1, r2));

        mockMvc.perform(get("/rooms").param("userId", "u1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("r1"))
                .andExpect(jsonPath("$[0].name").value("Team A"))
                .andExpect(jsonPath("$[0].direct").value(false))
                .andExpect(jsonPath("$[1].id").value("r2"))
                .andExpect(jsonPath("$[1].direct").value(true));
    }

    @Test
    void createRoom_shouldReturnDto() throws Exception {
        CreateRoomRequest req = new CreateRoomRequest("Team X", "u1", List.of("u2", "u3"));

        ChatRoom room = new ChatRoom();
        room.setId("rx");
        room.setName("Team X");
        room.setDirect(false);

        when(chatRoomService.createTeamRoom(eq("Team X"), eq("u1"), eq(List.of("u2", "u3"))))
                .thenReturn(room);

        mockMvc.perform(post("/rooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("rx"))
                .andExpect(jsonPath("$.name").value("Team X"))
                .andExpect(jsonPath("$.direct").value(false));
    }

    @Test
    void getOrCreateDirectRoom_shouldReturnDirectRoom() throws Exception {
        ChatRoom room = new ChatRoom();
        room.setId("d1");
        room.setName("u1_u2");
        room.setDirect(true);

        when(chatRoomService.getOrCreateDirectRoom("u1", "u2")).thenReturn(room);

        mockMvc.perform(get("/rooms/private")
                        .param("userId", "u1")
                        .param("otherId", "u2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("d1"))
                .andExpect(jsonPath("$.direct").value(true));
    }
}
