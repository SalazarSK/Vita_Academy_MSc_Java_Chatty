package com.tech.api.controller;

import com.tech.api.dto.MessageDto;
import com.tech.api.dto.SendMessageRequest;
import com.tech.api.entity.Message;
import com.tech.api.entity.User;
import com.tech.api.mapper.ChatMapper;
import com.tech.api.repository.MessageRepository;
import com.tech.api.service.MessageService;
import com.tech.api.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.ZonedDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MessageServiceTest {

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private MessageService messageService;

    @Mock
    private ChatMapper mapper;

    @Test
    void sendMessage() {
        // given
        SendMessageRequest req = new SendMessageRequest(
                "from-id",
                "to-id",
                "Hello world"
        );

        User fromUser = new User();
        fromUser.setId("from-id");

        User toUser = new User();
        toUser.setId("to-id");

        when(userService.getById("from-id")).thenReturn(fromUser);
        when(userService.getById("to-id")).thenReturn(toUser);

        Message saved = new Message();
        saved.setId(UUID.randomUUID().toString());
        saved.setFrom(fromUser);
        saved.setTo(toUser);
        saved.setContent("Hello world");
        saved.setSentAt(ZonedDateTime.now());

        MessageDto mapped = new MessageDto(
                saved.getId(),
                saved.getFrom().getId(),
                saved.getTo().getId(),
                saved.getContent(),
                saved.getSentAt()
        );

        when(mapper.toMessageDto(saved)).thenReturn(mapped);

        // when save() is called, return our "saved" entity
        when(messageRepository.save(any(Message.class))).thenReturn(saved);

        // when
        MessageDto result = messageService.sendMessage(req);

        // then
        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(saved.getId());
        assertThat(result.fromUserId()).isEqualTo("from-id");
        assertThat(result.toUserId()).isEqualTo("to-id");
        assertThat(result.content()).isEqualTo("Hello world");

        // verify repository interaction
        verify(messageRepository).save(any(Message.class));

        // verify user activity touch
        verify(userService).touch("from-id");
    }
}
