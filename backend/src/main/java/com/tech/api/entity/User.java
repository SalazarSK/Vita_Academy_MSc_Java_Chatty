package com.tech.api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Getter
@Setter
public class User {
    @Id
    private String id = UUID.randomUUID().toString();
    private String firstName;
    private String lastName;
    @Column(unique = true)
    private String username;
    private String password;
    @Enumerated(value = EnumType.STRING)
    private UserRole role = UserRole.USER;
    private ZonedDateTime created = ZonedDateTime.now();
    private ZonedDateTime updated;
}
