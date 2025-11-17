package com.tech.api.controller;

import com.tech.api.dto.MessageDto;
import com.tech.api.dto.SendMessageRequest;
import com.tech.api.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @GetMapping("/conversation")
    public List<MessageDto> conversation(
            @RequestParam String userId,
            @RequestParam String otherId
    ) {
        return messageService.getConversation(userId, otherId);
    }

    @PostMapping
    public MessageDto send(@RequestBody SendMessageRequest request) {
        return messageService.sendMessage(request);
    }
}
