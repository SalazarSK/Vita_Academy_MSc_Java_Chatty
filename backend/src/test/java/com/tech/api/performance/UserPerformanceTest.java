package com.tech.api.performance;

import com.tech.api.configuration.SecurityConfig;
import com.tech.api.controller.UserController;
import com.tech.api.dto.UserRespDTO;
import com.tech.api.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
@Import(SecurityConfig.class)
class UserPerformanceTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @Test
    @WithMockUser(username = "perf-tester")
    void getUsers_fiftyTimes_underOneSecond() throws Exception {
        int count = 50;

        when(userService.getAllUsers()).thenReturn(List.of(
                new UserRespDTO("id-1", "alice", "Alice", "Wonderland", true),
                new UserRespDTO("id-2", "bob", "Bob", "Bobik", false)
        ));

        long start = System.currentTimeMillis();

        for (int i = 0; i < count; i++) {
            mockMvc.perform(get("/user/users"))
                    .andExpect(status().isOk());
        }

        long durationMs = System.currentTimeMillis() - start;
        System.out.println("getUsers 50x duration: " + durationMs + " ms");

        assertThat(durationMs).isLessThan(1000); // podľa HW si môžeš zvýšiť
    }
}
