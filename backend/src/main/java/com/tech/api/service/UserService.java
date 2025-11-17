package com.tech.api.service;

import com.tech.api.dto.LoginRequest;
import com.tech.api.dto.LoginResponse;
import com.tech.api.dto.UserDTO;
import com.tech.api.dto.UserRespDTO;
import com.tech.api.entity.User;
import com.tech.api.mapper.ChatMapper;
import com.tech.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    public List<User> getUsers() {
        return userRepository.findAll();
    }
    private final PasswordEncoder passwordEncoder;
    private final ChatMapper mapper;


    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public User createUser(UserDTO dto) {
        Optional<User> userExist = findByUsername(dto.userName());
        if(userExist.isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already taken");
        }
        User user = new User();
        user.setFirstName(dto.firstName());
        user.setLastName(dto.lastName());
        user.setPassword(dto.password());
        user.setUsername(dto.userName());
        return userRepository.save(user);
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        touch(user.getId());

        return new LoginResponse(
                user.getId(),
                user.getUsername(),
                user.getFirstName(),
                user.getLastName()
        );
    }

    public List<UserRespDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(mapper::toUserDto)
                .toList();
    }

    public User getById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public void logout(String userId) {
        userRepository.findById(userId).ifPresent(u -> {
            u.setLastSeen(ZonedDateTime.now().minusMinutes(10));
            userRepository.save(u);
        });
    }

    public void touch(String userId) {
        userRepository.findById(userId).ifPresent(u -> {
            u.setLastSeen(ZonedDateTime.now());
            userRepository.save(u);
        });
    }
}
