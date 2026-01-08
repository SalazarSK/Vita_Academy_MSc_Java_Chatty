package com.tech.api.controller;

import com.tech.api.dto.UserStatusDto;
import com.tech.api.security.JwtService;
import com.tech.api.service.PresenceService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;

import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc(addFilters = false)
class PresenceWebSocketControllerTest {
    @MockBean JwtService jwtService;
    @Mock PresenceService presenceService;
    @InjectMocks PresenceWebSocketController controller;

    @Test
    void updatePresence_shouldCallService() {
        UserStatusDto dto = new UserStatusDto();
        dto.setUserId("u1");
        dto.setOnline(true);
        controller.updatePresence(dto);
        verify(presenceService).updateStatus("u1", true);
    }
}
