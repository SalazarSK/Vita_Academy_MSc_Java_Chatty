package com.tech.api.dto;

public record ChatRoomDto(
        String id,
        String name,
        boolean direct
) {}
