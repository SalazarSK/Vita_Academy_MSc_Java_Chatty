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
public class Message {

    @Id
    private String id = UUID.randomUUID().toString();

    @ManyToOne(optional = false)
    @JoinColumn(name = "from_user_id")
    private User from;

    @ManyToOne(optional = false)
    @JoinColumn(name = "room_id")
    private ChatRoom room;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @ManyToMany
    @JoinTable(
            name = "message_tags",
            joinColumns = @JoinColumn(name = "message_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<Tag> tags = new HashSet<>();

    private ZonedDateTime sentAt = ZonedDateTime.now();
}
