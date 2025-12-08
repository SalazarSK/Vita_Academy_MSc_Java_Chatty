package com.tech.api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.ZonedDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Getter
@Setter
public class ChatRoom {

    @Id
    private String id = UUID.randomUUID().toString();

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    // true = 1v1 private chat, false = team room
    private boolean direct;

    // unikátny kľúč pre dvojicu userov, napr. "u1_u5"
    @Column(unique = true)
    private String directKey;

    @ManyToMany
    @JoinTable(
            name = "chat_room_members",
            joinColumns = @JoinColumn(name = "room_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> members = new HashSet<>();

    private ZonedDateTime created = ZonedDateTime.now();
}
