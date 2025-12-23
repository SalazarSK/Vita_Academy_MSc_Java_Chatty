package com.tech.api.entity;

import com.tech.api.enums.TopicStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Getter
@Setter
public class Topic {

    @Id
    private String id = UUID.randomUUID().toString();

    @ManyToOne(optional = false)
    @JoinColumn(name = "room_id")
    private ChatRoom room;

    @ManyToOne(optional = false)
    @JoinColumn(name = "created_by_user_id")
    private User createdBy;

    @Column(nullable = false, length = 160)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TopicStatus status = TopicStatus.OPEN;

    private ZonedDateTime createdAt = ZonedDateTime.now();
    private ZonedDateTime closedAt;

    // ak budeš exportovať na GitHub
    private String githubIssueUrl;
    private Integer githubIssueNumber;
}
