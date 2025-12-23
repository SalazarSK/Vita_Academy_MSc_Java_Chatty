package com.tech.api.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.ZonedDateTime;
import java.util.Set;

@Getter @Setter
public class MessageResponse {
    private String id;
    private String roomId;
    private String topicId;

    private String fromUserId;
    private String fromUsername;

    private String content;
    private Set<String> tags;

    private ZonedDateTime sentAt;
}
