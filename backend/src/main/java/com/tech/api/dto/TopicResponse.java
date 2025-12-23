package com.tech.api.dto;

import com.tech.api.enums.TopicStatus;
import java.time.ZonedDateTime;

public record TopicResponse(
        String id,
        String roomId,
        String title,
        TopicStatus status,
        ZonedDateTime createdAt,
        ZonedDateTime closedAt,
        String createdById,
        String createdByUsername,
        long messagesCount,
        ZonedDateTime lastActivityAt
) {}