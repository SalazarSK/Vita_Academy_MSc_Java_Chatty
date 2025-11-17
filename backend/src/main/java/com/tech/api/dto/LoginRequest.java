package com.tech.api.dto;

public record LoginRequest(
        String username,
        String password
) {}
