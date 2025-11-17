package com.tech.api.dto;

public record UserRespDTO(
        String uid,
        String firstName,
        String lastName,
        String userName,
        boolean online

) {

}
