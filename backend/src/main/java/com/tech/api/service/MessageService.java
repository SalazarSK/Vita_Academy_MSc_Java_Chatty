package com.tech.api.service;

import com.tech.api.dto.MessageDto;
import com.tech.api.dto.SendMessageRequest;
import com.tech.api.entity.ChatRoom;
import com.tech.api.entity.Message;
import com.tech.api.entity.Tag;
import com.tech.api.entity.User;
import com.tech.api.mapper.ChatMapper;
import com.tech.api.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserService userService;
    private final ChatRoomService chatRoomService;
    private final TagService tagService;
    private final ChatMapper mapper;

    public List<MessageDto> getMessagesForRoom(String roomId, String userId) {
        userService.touch(userId);

        return messageRepository
                .findByRoomIdOrderBySentAtAsc(roomId)
                .stream()
                .map(mapper::toMessageDto)
                .toList();
    }

    public List<MessageDto> getMessagesForRoomByTag(String roomId, String tagName, String userId) {
        userService.touch(userId);

        return messageRepository
                .findByRoomIdAndTagsNameOrderBySentAtAsc(roomId, tagName)
                .stream()
                .map(mapper::toMessageDto)
                .toList();
    }

    public MessageDto sendMessage(SendMessageRequest request) {
        User from = userService.getById(request.fromUserId());
        ChatRoom room = chatRoomService.getById(request.roomId());
        Set<Tag> tags = tagService.resolveTags(request.tags());

        Message m = new Message();
        m.setFrom(from);
        m.setRoom(room);
        m.setContent(request.content());
        m.setTags(tags);

        userService.touch(from.getId());

        Message saved = messageRepository.save(m);
        return mapper.toMessageDto(saved);
    }
}
