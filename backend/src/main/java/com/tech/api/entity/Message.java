package com.tech.api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.ZonedDateTime;
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
    @JoinColumn(name = "to_user_id")
    private User to;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    private ZonedDateTime sentAt = ZonedDateTime.now();
}

