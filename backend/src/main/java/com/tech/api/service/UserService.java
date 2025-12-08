package com.tech.api.service;

import com.tech.api.dto.*;
import com.tech.api.entity.User;
import com.tech.api.mapper.ChatMapper;
import com.tech.api.repository.UserRepository;
import com.tech.api.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
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
    private final PasswordEncoder passwordEncoder;
    private final ChatMapper mapper;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public List<User> getUsers() {
        return userRepository.findAll();
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public User createUser(UserDTO dto) {
        Optional<User> userExist = findByUsername(dto.userName());
        if (userExist.isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already taken");
        }
        User user = new User();
        user.setFirstName(dto.firstName());
        user.setLastName(dto.lastName());
        user.setUsername(dto.userName());
        user.setPassword(passwordEncoder.encode(dto.password())); // 🔐 encode
        return userRepository.save(user);
    }

    public AuthResponse login(LoginRequest request) {
        // overenie prihlasovacích údajov cez AuthenticationManager
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.username(),
                        request.password()
                )
        );

        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        touch(user.getId());

        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPassword())
                .roles("USER")
                .build();

        String token = jwtService.generateToken(userDetails);

        LoginResponse loginResponse = new LoginResponse(
                user.getId(),
                user.getUsername(),
                user.getFirstName(),
                user.getLastName()
        );

        return new AuthResponse(token, loginResponse);
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new RuntimeException("Username already taken");
        }

        User user = new User();
        user.setUsername(request.username());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setCreated(ZonedDateTime.now());
        user.setLastSeen(ZonedDateTime.now());

        userRepository.save(user);

        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPassword())
                .roles("USER")
                .build();

        String token = jwtService.generateToken(userDetails);

        LoginResponse loginResponse = new LoginResponse(
                user.getId(),
                user.getUsername(),
                user.getFirstName(),
                user.getLastName()
        );

        return new AuthResponse(token, loginResponse);
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