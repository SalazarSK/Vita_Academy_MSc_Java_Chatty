package com.tech.api.dto;

import java.util.List;

public record SendMessageRequest(
        String roomId,
        String fromUserId,
        String content,
        List<String> tags,
        String topicId
) {}
