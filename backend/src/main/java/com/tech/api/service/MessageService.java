package com.tech.api.service;

import com.tech.api.dto.MessageDto;
import com.tech.api.dto.SendMessageRequest;
import com.tech.api.entity.ChatRoom;
import com.tech.api.entity.Message;
import com.tech.api.entity.Tag;
import com.tech.api.entity.Topic;
import com.tech.api.entity.User;
import com.tech.api.enums.TopicStatus;
import com.tech.api.mapper.ChatMapper;
import com.tech.api.repository.MessageRepository;
import com.tech.api.repository.TopicRepository;
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
    private final TopicRepository topicRepository;
    private final ChatMapper mapper;

    public List<MessageDto> getMessagesForRoom(String roomId, String userId) {
        userService.touch(userId);

        return messageRepository
                .findByRoom_IdAndTopicIsNullOrderBySentAtAsc(roomId)
                .stream()
                .map(mapper::toMessageDto)
                .toList();
    }

    public List<MessageDto> getMessagesForRoomByTag(String roomId, String tagName, String userId) {
        userService.touch(userId);

        return messageRepository
                .findByRoom_IdAndTopicIsNullAndTags_NameOrderBySentAtAsc(roomId, tagName)
                .stream()
                .map(mapper::toMessageDto)
                .toList();
    }

    public List<MessageDto> getMessagesForRoomByTopic(String roomId, String topicId, String userId) {
        userService.touch(userId);

        Topic t = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found"));

        if (!t.getRoom().getId().equals(roomId)) {
            throw new RuntimeException("Topic room mismatch");
        }

        return messageRepository
                .findByRoom_IdAndTopic_IdOrderBySentAtAsc(roomId, topicId)
                .stream()
                .map(mapper::toMessageDto)
                .toList();
    }

    public MessageDto sendMessage(SendMessageRequest request) {
        User from = userService.getById(request.fromUserId());
        ChatRoom room = chatRoomService.getById(request.roomId());
        Set<Tag> tags = tagService.resolveTags(request.tags());

        // topic (optional) – načítaj + validuj len raz
        Topic topic = null;
        if (request.topicId() != null && !request.topicId().isBlank()) {
            topic = topicRepository.findById(request.topicId())
                    .orElseThrow(() -> new RuntimeException("Topic not found"));

            if (!topic.getRoom().getId().equals(room.getId())) {
                throw new RuntimeException("Topic room mismatch");
            }
            if (topic.getStatus() == TopicStatus.CLOSED) {
                throw new RuntimeException("Topic is closed");
            }
        }

        Message m = new Message();
        m.setFrom(from);
        m.setRoom(room);
        m.setContent(request.content());
        m.setTags(tags);

        if (topic != null) {
            m.setTopic(topic);
        }

        userService.touch(from.getId());

        Message saved = messageRepository.save(m);
        return mapper.toMessageDto(saved);
    }

    public List<MessageDto> searchMessagesInRoom(String roomId, String q, String userId) {
        return messageRepository
                .findByRoom_IdAndContentContainingIgnoreCaseOrderBySentAtAsc(roomId, q.trim())
                .stream().map(mapper::toMessageDto).toList();
    }

}
