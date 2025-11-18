package com.tech.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tech.api.configuration.SecurityConfig;
import com.tech.api.dto.*;
import com.tech.api.service.UserService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
@Import(SecurityConfig.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    @Test
    void login_shouldReturnLoginResponse() throws Exception {
        LoginRequest req = new LoginRequest("alice", "password");
        LoginResponse resp = new LoginResponse(
                "user-id-1",
                "alice",
                "Alice",
                "Wonderland"
        );

        when(userService.login(any(LoginRequest.class))).thenReturn(resp);

        mockMvc.perform(post("/user/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/user/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is("user-id-1")))
                .andExpect(jsonPath("$.username", is("alice")))
                .andExpect(jsonPath("$.firstName", is("Alice")))
                .andExpect(jsonPath("$.lastName", is("Wonderland")));
    }

    @Test
    void register_shouldCreateUserAndReturnLoginResponse() throws Exception {
        RegisterRequest req = new RegisterRequest(
                "bob",
                "secret",
                "Bob",
                "Bobik"
        );

        LoginResponse resp = new LoginResponse(
                "user-id-2",
                "bob",
                "Bob",
                "Bobik"
        );

        when(userService.register(any(RegisterRequest.class))).thenReturn(resp);

        mockMvc.perform(post("/user/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is("user-id-2")))
                .andExpect(jsonPath("$.username", is("bob")))
                .andExpect(jsonPath("$.firstName", is("Bob")))
                .andExpect(jsonPath("$.lastName", is("Bobik")));
    }

    @Test
    @WithMockUser(username = "tester")
    void getUsers_shouldReturnListOfUsers() throws Exception {
        UserRespDTO u1 = new UserRespDTO("id-1", "alice", "Alice", "Wonderland", true);
        UserRespDTO u2 = new UserRespDTO("id-2", "bob", "Bob", "Bobik", false);

        when(userService.getAllUsers()).thenReturn(List.of(u1, u2));

        mockMvc.perform(get("/user/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].uid", is("id-1")))
                .andExpect(jsonPath("$[0].userName", is("Wonderland")))
                .andExpect(jsonPath("$[0].online", is(true)))
                .andExpect(jsonPath("$[1].uid", is("id-2")))
                .andExpect(jsonPath("$[1].userName", is("Bobik")))
                .andExpect(jsonPath("$[1].online", is(false)));
    }

    @Test
    void logout_shouldCallServiceAndReturnOk() throws Exception {
        mockMvc.perform(post("/user/logout")
                        .param("userId", "user-id-1"))
                .andExpect(status().isOk());

        verify(userService).logout(eq("user-id-1"));
    }
}
