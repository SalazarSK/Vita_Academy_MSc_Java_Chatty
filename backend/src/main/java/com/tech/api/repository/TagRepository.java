package com.tech.api.repository;

import com.tech.api.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TagRepository extends JpaRepository<Tag, String> {
    Optional<Tag> findByName(String name);
}
