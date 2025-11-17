package com.tech.api.dto;

public record UserDTO(
        String firstName,
        String lastName,
        String password,
        String userName
        ) {
}
