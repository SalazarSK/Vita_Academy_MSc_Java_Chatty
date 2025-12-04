package com.tech.api.service;

import com.tech.api.entity.Tag;
import com.tech.api.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class TagService {

    private final TagRepository tagRepository;

    public Set<Tag> resolveTags(List<String> tagNames) {
        if (tagNames == null || tagNames.isEmpty()) {
            return Collections.emptySet();
        }

        Set<Tag> result = new HashSet<>();

        for (String name : tagNames) {
            if (!StringUtils.hasText(name)) {
                continue;
            }
            String normalized = name.trim().toLowerCase();

            Tag tag = tagRepository
                    .findByName(normalized)
                    .orElseGet(() -> {
                        Tag t = new Tag();
                        t.setName(normalized);
                        return tagRepository.save(t);
                    });

            result.add(tag);
        }

        return result;
    }
}
