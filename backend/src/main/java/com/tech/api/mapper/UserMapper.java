package com.tech.api.mapper;

import com.tech.api.dto.UserRespDTO;
import com.tech.api.entity.User;
import lombok.experimental.UtilityClass;

import java.time.ZonedDateTime;

@UtilityClass
public class UserMapper {
    public static UserRespDTO toRespDTO(User user) {
        return new UserRespDTO(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getUsername(),
                isOnline(user.getLastSeen())
        );
    }

    private boolean isOnline(ZonedDateTime lastSeen) {
        if (lastSeen == null) return false;
        return lastSeen.isAfter(ZonedDateTime.now().minusMinutes(1));
    }
}
