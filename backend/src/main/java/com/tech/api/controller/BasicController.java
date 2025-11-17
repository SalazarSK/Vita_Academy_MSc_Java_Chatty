package com.tech.api.controller;

import com.tech.api.dto.UserDTO;
import com.tech.api.dto.UserRespDTO;
import com.tech.api.entity.User;
import com.tech.api.mapper.UserMapper;
import com.tech.api.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/basic")
@RequiredArgsConstructor
public class BasicController {
    private final UserService userService;

    @GetMapping
    public String get() {
        List<User> users = userService.getUsers();
        return "Hello World";
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
}
