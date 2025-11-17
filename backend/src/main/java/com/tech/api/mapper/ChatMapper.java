package com.tech.api.mapper;

import com.tech.api.dto.MessageDto;
import com.tech.api.dto.UserRespDTO;
import com.tech.api.entity.Message;
import com.tech.api.entity.User;
import org.springframework.stereotype.Component;

import java.time.ZonedDateTime;

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
        return new MessageDto(
                m.getId(),
                m.getFrom().getId(),
                m.getTo().getId(),
                m.getContent(),
                m.getSentAt()
        );
    }

    private boolean isOnline(ZonedDateTime lastSeen) {
        if (lastSeen == null) return false;
        return lastSeen.isAfter(ZonedDateTime.now().minusMinutes(1));
    }
}
