package com.tech.api.controller;

import com.tech.api.dto.MessageDto;
import com.tech.api.dto.SendMessageRequest;
import com.tech.api.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/rooms")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @GetMapping("/{roomId}/messages")
    public List<MessageDto> getMessages(
            @PathVariable String roomId,
            @RequestParam String userId,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String topicId,
            @RequestParam(required = false) String q
    ) {
        if (topicId != null && !topicId.isBlank()) {
            return messageService.getMessagesForRoomByTopic(roomId, topicId, userId);
        }
        if (tag != null && !tag.isBlank()) {
            return messageService.getMessagesForRoomByTag(roomId, tag, userId);
        }
        if (q != null && !q.isBlank()) {
            return messageService.searchMessagesInRoom(roomId, q, userId);
        }
        return messageService.getMessagesForRoom(roomId, userId);
    }


    @PostMapping("/{roomId}/messages")
    public MessageDto send(
            @PathVariable String roomId,
            @RequestBody SendMessageRequest request
    ) {
        SendMessageRequest fixed = new SendMessageRequest(
                roomId,
                request.fromUserId(),
                request.content(),
                request.tags(),
                request.topicId()
        );
        return messageService.sendMessage(fixed);
    }
}
