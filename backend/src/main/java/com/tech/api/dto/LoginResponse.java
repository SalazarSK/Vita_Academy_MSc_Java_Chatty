package com.tech.api.dto;

public record LoginResponse(
        String id,
        String username,
        String firstName,
        String lastName
) {}