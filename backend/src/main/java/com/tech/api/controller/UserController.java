package com.tech.api.controller;

import com.tech.api.dto.LoginRequest;
import com.tech.api.dto.LoginResponse;
import com.tech.api.dto.UserDTO;
import com.tech.api.dto.UserRespDTO;
import com.tech.api.entity.User;
import com.tech.api.mapper.UserMapper;
import com.tech.api.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PostMapping("/auth/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        return userService.login(request);
    }

    @GetMapping("/users")
    public List<UserRespDTO> getUsers() {
        return userService.getAllUsers();
    }

    @PostMapping
    public UserRespDTO post(@RequestBody UserDTO dto) {
        return UserMapper.toRespDTO(userService.createUser(dto));
    }
    @PutMapping("/{id}")
    public String put(@PathVariable String id) {
        return id;
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable String id) {
        return id;
    }

    @PostMapping("/logout")
    public void logout(@RequestParam String userId) {
        userService.logout(userId);
    }
}
