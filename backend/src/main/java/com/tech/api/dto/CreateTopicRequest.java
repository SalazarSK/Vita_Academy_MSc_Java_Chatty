package com.tech.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class CreateTopicRequest {
    @NotBlank
    @Size(max = 160)
    private String title;
}
