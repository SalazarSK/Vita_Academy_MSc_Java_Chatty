package com.tech.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class UpdateTopicStatusRequest {
    @NotBlank
    private String status; // OPEN | CLOSED
}
