package com.tech.api.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter @Setter
public class AssignMessagesRequest {
    @NotEmpty
    private Set<String> messageIds;
}
