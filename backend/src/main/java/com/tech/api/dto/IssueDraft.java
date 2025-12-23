package com.tech.api.dto;

import java.util.List;

public record IssueDraft(
        String title,
        String body,
        List<String> labels
) {}
