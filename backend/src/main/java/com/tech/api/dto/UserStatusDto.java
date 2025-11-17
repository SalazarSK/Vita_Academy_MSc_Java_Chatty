package com.tech.api.dto;

import lombok.Data;

@Data
public class UserStatusDto {
    private String userId;
    private boolean online;
}
