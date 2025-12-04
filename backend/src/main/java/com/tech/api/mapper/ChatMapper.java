package com.tech.api.mapper;

import com.tech.api.dto.MessageDto;
import com.tech.api.dto.UserRespDTO;
import com.tech.api.entity.Message;
import com.tech.api.entity.Tag;
import com.tech.api.entity.User;
import org.springframework.stereotype.Component;

import java.time.ZonedDateTime;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class ChatMapper {

    public UserRespDTO toUserDto(User u) {
        return new UserRespDTO(
                u.getId(),
                u.getUsername(),
                u.getFirstName(),
                u.getLastName(),
                isOnline(u.getLastSeen())
        );
    }

    public MessageDto toMessageDto(Message m) {
        Set<String> tagNames = m.getTags()
                .stream()
                .map(Tag::getName)
                .collect(Collectors.toSet());

        return new MessageDto(
                m.getId(),
                m.getFrom().getId(),
                m.getRoom().getId(),
                m.getContent(),
                m.getSentAt(),
                tagNames
        );
    }

    private boolean isOnline(ZonedDateTime lastSeen) {
        if (lastSeen == null) return false;
        return lastSeen.isAfter(ZonedDateTime.now().minusMinutes(1));
    }
}
