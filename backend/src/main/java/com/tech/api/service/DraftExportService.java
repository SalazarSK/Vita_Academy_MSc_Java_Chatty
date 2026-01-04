package com.tech.api.service;

import com.tech.api.dto.IssueDraft;
import com.tech.api.entity.Message;
import com.tech.api.entity.Topic;
import com.tech.api.repository.MessageRepository;
import com.tech.api.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DraftExportService {

    private final TopicRepository topicRepository;
    private final MessageRepository messageRepository;
    private final IssueDraftAiService issueDraftAiService;

    public IssueDraft generateDraft(String roomId, String topicId) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found"));

        List<Message> messages = messageRepository
                .findByRoom_IdAndTopic_IdOrderBySentAtAsc(topic.getRoom().getId(), topic.getId());

        return issueDraftAiService.draft(
                topic,
                messages,
                IssueDraftAiService.OutputLang.EN
        );
    }
}
