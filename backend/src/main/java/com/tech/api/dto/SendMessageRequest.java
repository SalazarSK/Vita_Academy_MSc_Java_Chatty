package com.tech.api.dto;

public record SendMessageRequest(
        String fromUserId,
        String toUserId,
        String content
) {}
