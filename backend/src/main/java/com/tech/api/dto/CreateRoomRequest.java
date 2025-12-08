package com.tech.api.dto;


import java.util.List;

public record CreateRoomRequest(
        String name,
        String creatorId,
        List<String> memberIds
) {}
