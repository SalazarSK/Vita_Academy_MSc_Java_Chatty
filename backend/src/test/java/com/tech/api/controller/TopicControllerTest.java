package com.tech.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tech.api.dto.CreateTopicRequest;
import com.tech.api.dto.TopicResponse;
import com.tech.api.entity.User;
import com.tech.api.enums.TopicStatus;
import com.tech.api.repository.UserRepository;
import com.tech.api.security.JwtService;
import com.tech.api.service.DraftExportService;
import com.tech.api.service.TopicService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TopicController.class)
@AutoConfigureMockMvc(addFilters = false)
class TopicControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockBean TopicService topicService;
    @MockBean DraftExportService draftExportService;
    @MockBean UserRepository userRepository;

    @MockBean JwtService jwtService;

    @AfterEach
    void cleanup() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createTopic_shouldUseCurrentUserFromSecurityContext() throws Exception {
        var auth = new UsernamePasswordAuthenticationToken(
                "john",
                "N/A",
                List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );
        SecurityContextHolder.getContext().setAuthentication(auth);

        User u = new User();
        u.setId("u1");
        u.setUsername("john");
        when(userRepository.findByUsername("john")).thenReturn(Optional.of(u));

        CreateTopicRequest req = new CreateTopicRequest();
        req.setTitle("Bug report");

        TopicResponse resp = new TopicResponse(
                "t1",
                "room1",
                "Bug report",
                TopicStatus.OPEN,
                ZonedDateTime.now(),
                null,
                "u1",
                "john",
                5,
                ZonedDateTime.now()
        );

        when(topicService.createTopic(eq("room1"), eq("u1"), any(CreateTopicRequest.class)))
                .thenReturn(resp);

        mockMvc.perform(post("/rooms/room1/topics")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("t1"))
                .andExpect(jsonPath("$.createdByUsername").value("john"));
    }
}
