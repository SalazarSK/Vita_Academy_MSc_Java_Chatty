package com.tech.api.service;

import com.tech.api.dto.MessageDto;
import com.tech.api.dto.SendMessageRequest;
import com.tech.api.entity.Message;
import com.tech.api.entity.User;
import com.tech.api.mapper.ChatMapper;
import com.tech.api.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserService userService;
    private final ChatMapper mapper;

    public List<MessageDto> getConversation(String userId, String otherId) {
        return messageRepository
                .findByFromIdAndToIdOrFromIdAndToIdOrderBySentAtAsc(
                        userId, otherId,
                        otherId, userId
                )
                .stream()
                .map(mapper::toMessageDto)
                .toList();
    }

    public MessageDto sendMessage(SendMessageRequest request) {
        User from = userService.getById(request.fromUserId());
        User to = userService.getById(request.toUserId());

        Message m = new Message();
        m.setFrom(from);
        m.setTo(to);
        m.setContent(request.content());

        Message saved = messageRepository.save(m);
        return mapper.toMessageDto(saved);
    }
}

