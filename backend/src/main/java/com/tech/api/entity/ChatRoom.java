package com.tech.api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Getter
@Setter
public class ChatRoom {

    @Id
    private String id = UUID.randomUUID().toString();

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    private ZonedDateTime created = ZonedDateTime.now();
}
