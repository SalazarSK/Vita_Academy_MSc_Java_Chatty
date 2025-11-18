package com.tech.api.dto;

public record RegisterRequest(
        String username,
        String password,
        String firstName,
        String lastName
) {}
