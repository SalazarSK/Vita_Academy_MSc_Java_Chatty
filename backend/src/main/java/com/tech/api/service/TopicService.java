package com.tech.api.service;

import com.tech.api.dto.AssignMessagesRequest;
import com.tech.api.dto.CreateTopicRequest;
import com.tech.api.dto.TopicResponse;
import com.tech.api.entity.ChatRoom;
import com.tech.api.entity.Message;
import com.tech.api.entity.Topic;
import com.tech.api.entity.User;
import com.tech.api.enums.TopicStatus;
import com.tech.api.repository.ChatRoomRepository;
import com.tech.api.repository.MessageRepository;
import com.tech.api.repository.TopicRepository;
import com.tech.api.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class TopicService {

    private final TopicRepository topicRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final UserRepository userRepository;
    private final MessageRepository messageRepository;

    public TopicService(
            TopicRepository topicRepository,
            ChatRoomRepository chatRoomRepository,
            UserRepository userRepository,
            MessageRepository messageRepository
    ) {
        this.topicRepository = topicRepository;
        this.chatRoomRepository = chatRoomRepository;
        this.userRepository = userRepository;
        this.messageRepository = messageRepository;
    }

    @Transactional
    public TopicResponse createTopic(String roomId, String currentUserId, CreateTopicRequest req) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        User me = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Topic t = new Topic();
        t.setRoom(room);
        t.setCreatedBy(me);
        t.setTitle(req.getTitle().trim());
        t.setStatus(TopicStatus.OPEN);

        Topic saved = topicRepository.save(t);
        return toResp(saved);
    }

    public List<TopicResponse> listTopics(String roomId, String statusOrNull) {
        List<Topic> topics;
        if (statusOrNull == null || statusOrNull.isBlank()) {
            topics = topicRepository.findByRoom_IdOrderByCreatedAtDesc(roomId);
        } else {
            TopicStatus status = TopicStatus.valueOf(statusOrNull.trim().toUpperCase());
            topics = topicRepository.findByRoom_IdAndStatusOrderByCreatedAtDesc(roomId, status);
        }
        return topics.stream().map(this::toResp).toList();
    }

    public TopicResponse getTopic(String topicId) {
        Topic t = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found"));
        return toResp(t);
    }

    @Transactional
    public TopicResponse closeTopic(String topicId, String currentUserId) {
        Topic t = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found"));

        if (t.getStatus() == TopicStatus.CLOSED) return toResp(t);

        t.setStatus(TopicStatus.CLOSED);
        t.setClosedAt(ZonedDateTime.now());

        Topic saved = topicRepository.save(t);
        return toResp(saved);
    }

    @Transactional
    public TopicResponse reopenTopic(String topicId, String currentUserId) {
        Topic t = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found"));

        if (t.getStatus() == TopicStatus.OPEN) return toResp(t);

        t.setStatus(TopicStatus.OPEN);
        t.setClosedAt(null);

        Topic saved = topicRepository.save(t);
        return toResp(saved);
    }

    @Transactional
    public void assignMessagesToTopic(String topicId, AssignMessagesRequest req) {
        Topic t = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found"));

        if (t.getStatus() == TopicStatus.CLOSED) {
            throw new RuntimeException("Topic is closed");
        }

        List<Message> toSave = new ArrayList<>();

        for (String mid : req.getMessageIds()) {
            Message m = messageRepository.findById(mid)
                    .orElseThrow(() -> new RuntimeException("Message not found: " + mid));

            if (!m.getRoom().getId().equals(t.getRoom().getId())) {
                throw new RuntimeException("Message room mismatch: " + mid);
            }

            m.setTopic(t);
            toSave.add(m);
        }

        messageRepository.saveAll(toSave);
    }

    @Transactional
    public void unassignMessage(String messageId) {
        Message m = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        m.setTopic(null);
        messageRepository.save(m);
    }

    private TopicResponse toResp(Topic t) {
        var msgs = messageRepository.findByRoom_IdAndTopic_IdOrderBySentAtAsc(
                t.getRoom().getId(),
                t.getId()
        );

        ZonedDateTime last = msgs.isEmpty()
                ? t.getCreatedAt()
                : msgs.get(msgs.size() - 1).getSentAt();

        return new TopicResponse(
                t.getId(),
                t.getRoom().getId(),
                t.getTitle(),
                t.getStatus(),
                t.getCreatedAt(),
                t.getClosedAt(),
                t.getCreatedBy().getId(),
                t.getCreatedBy().getUsername(),
                msgs.size(),
                last
        );
    }
}
