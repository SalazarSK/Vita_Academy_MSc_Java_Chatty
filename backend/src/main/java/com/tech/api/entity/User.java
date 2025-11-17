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

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false)
    private String password;

    private String firstName;
    private String lastName;

    private ZonedDateTime created = ZonedDateTime.now();
    private ZonedDateTime updated;
    private ZonedDateTime lastSeen;
}
