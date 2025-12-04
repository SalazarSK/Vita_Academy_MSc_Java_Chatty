package com.tech.api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Getter
@Setter
public class Tag {

    @Id
    private String id = UUID.randomUUID().toString();

    @Column(nullable = false, unique = true, length = 100)
    private String name;
}
