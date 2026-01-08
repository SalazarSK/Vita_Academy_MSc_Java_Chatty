package com.tech.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tech.api.dto.AuthResponse;
import com.tech.api.dto.LoginRequest;
import com.tech.api.dto.LoginResponse;
import com.tech.api.security.JwtService;
import com.tech.api.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
class UserControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockBean UserService userService;
    @MockBean JwtService jwtService;

    @Test
    void login_shouldReturnAuthResponse() throws Exception {
        when(userService.login(any(LoginRequest.class)))
                .thenReturn(new AuthResponse(
                        "jwt-token",
                        new LoginResponse("u1", "john", "john", "lastname")
                ));

        mockMvc.perform(post("/user/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new LoginRequest("john", "pass")
                        )))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.user.username").value("john"));


    }

    @Test
    void logout_shouldReturn200() throws Exception {
        doNothing().when(userService).logout("u1");

        mockMvc.perform(post("/user/logout").param("userId", "u1"))
                .andExpect(status().isOk());
    }
}
