package com.tech.api.dto;

public record AuthResponse(
        String token,
        LoginResponse user
) {}
