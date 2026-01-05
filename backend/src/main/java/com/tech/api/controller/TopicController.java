package com.tech.api.controller;

import com.tech.api.dto.*;
import com.tech.api.repository.UserRepository;
import com.tech.api.service.DraftExportService;
import com.tech.api.service.TopicService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class TopicController {

    private final TopicService topicService;
    private final DraftExportService draftExportService;
    private final UserRepository userRepository;

    private String currentUserId() {
        var auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext()
                .getAuthentication();

        if (auth == null || !auth.isAuthenticated()) {
            throw new RuntimeException("Unauthenticated");
        }

        String username = auth.getName(); // ✅ z JWT (subject / username)
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }

    @PostMapping("/rooms/{roomId}/topics")
    public TopicResponse create(@PathVariable String roomId, @Valid @RequestBody CreateTopicRequest req) {
        return topicService.createTopic(roomId, currentUserId(), req);
    }

    @GetMapping("/rooms/{roomId}/topics")
    public List<TopicResponse> list(@PathVariable String roomId, @RequestParam(required = false) String status) {
        return topicService.listTopics(roomId, status);
    }

    @GetMapping("/topics/{topicId}")
    public TopicResponse detail(@PathVariable String topicId) {
        return topicService.getTopic(topicId);
    }

    @PatchMapping("/topics/{topicId}/close")
    public TopicResponse close(@PathVariable String topicId) {
        return topicService.closeTopic(topicId, currentUserId());
    }

    @PatchMapping("/topics/{topicId}/reopen")
    public TopicResponse reopen(@PathVariable String topicId) {
        return topicService.reopenTopic(topicId, currentUserId());
    }

    @PostMapping("/topics/{topicId}/messages/assign")
    public void assign(@PathVariable String topicId, @Valid @RequestBody AssignMessagesRequest req) {
        topicService.assignMessagesToTopic(topicId, req);
    }

    @DeleteMapping("/messages/{messageId}/topic")
    public void unassign(@PathVariable String messageId) {
        topicService.unassignMessage(messageId);
    }

    @PostMapping("/rooms/{roomId}/topics/{topicId}/export/draft")
    public IssueDraft exportDraft(
            @PathVariable String roomId,
            @PathVariable String topicId
    ) {
        return draftExportService.generateDraft(roomId, topicId);
    }

    @PatchMapping("/rooms/{roomId}/topics/{topicId}/status")
    public TopicResponse updateStatus(
            @PathVariable String roomId,
            @PathVariable String topicId,
            @Valid @RequestBody UpdateTopicStatusRequest req
    ) {
        return topicService.updateStatus(roomId, topicId, currentUserId(), req.getStatus());
    }

}
