package com.tech.api.dto;

import java.time.ZonedDateTime;
import java.util.Set;

public record MessageDto(
        String id,
        String fromUserId,
        String toUserId,
        String content,
        ZonedDateTime sentAt,
        Set<String> tags,
        String topicId
) {}


