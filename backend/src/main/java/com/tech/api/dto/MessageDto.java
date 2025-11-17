package com.tech.api.dto;

import java.time.ZonedDateTime;

public record MessageDto(
        String id,
        String fromUserId,
        String toUserId,
        String content,
        ZonedDateTime sentAt
) {}


