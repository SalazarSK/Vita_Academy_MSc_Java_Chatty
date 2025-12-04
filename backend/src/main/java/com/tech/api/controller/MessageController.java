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
            @RequestParam(required = false) String tag
    ) {
        if (tag != null && !tag.isBlank()) {
            return messageService.getMessagesForRoomByTag(roomId, tag, userId);
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
                request.tags()
        );

        return messageService.sendMessage(fixed);
    }
}
