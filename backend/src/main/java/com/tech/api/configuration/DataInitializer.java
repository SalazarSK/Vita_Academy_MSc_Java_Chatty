package com.tech.api.configuration;

import com.tech.api.entity.ChatRoom;
import com.tech.api.entity.Message;
import com.tech.api.entity.Topic;
import com.tech.api.entity.User;
import com.tech.api.enums.TopicStatus;
import com.tech.api.repository.ChatRoomRepository;
import com.tech.api.repository.MessageRepository;
import com.tech.api.repository.TopicRepository;
import com.tech.api.repository.UserRepository;
import com.tech.api.service.ChatRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository userRepository;
    private final MessageRepository messageRepository;
    private final TopicRepository topicRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final PasswordEncoder passwordEncoder;
    private final ChatRoomService chatRoomService;

    @Bean
    public ApplicationRunner init() {
        return args -> {

            // 1) users (vytvor iba ak neexistujú podľa username)
            User alice = getOrCreateUser("Alice", "Wonder", "alice", "password1");
            User bob = getOrCreateUser("Bob", "Marley", "bob", "password2");
            User charlie = getOrCreateUser("Charlie", "Brown", "charlie", "password3");

            // 2) room general (vytvor iba ak neexistuje)
            ChatRoom general = getOrCreateGeneralRoom(alice, bob, charlie);

            // 3) ak už existujú topics v general, tak už to nerob znova
            boolean hasTopics = topicRepository.countByRoom_Id(general.getId()) > 0;
            if (hasTopics) {
                System.out.println("Demo data already present (topics exist). Skipping.");
                return;
            }

            // --- TOPICS ---
            Topic bugTopic = new Topic();
            bugTopic.setRoom(general);
            bugTopic.setCreatedBy(alice);
            bugTopic.setTitle("Bug: messages are not sorted correctly");
            bugTopic.setStatus(TopicStatus.OPEN);
            topicRepository.save(bugTopic);

            Topic featureTopic = new Topic();
            featureTopic.setRoom(general);
            featureTopic.setCreatedBy(bob);
            featureTopic.setTitle("Feature: add dark mode");
            featureTopic.setStatus(TopicStatus.CLOSED);
            featureTopic.setClosedAt(ZonedDateTime.now().minusHours(2));
            topicRepository.save(featureTopic);

            // --- MESSAGES (no topic) ---
            Message m1 = createMessage(alice, general, "Hi Bob, how are you?");
            Message m2 = createMessage(bob, general, "Doing great, Alice!");
            Message m3 = createMessage(charlie, general, "Hello everyone!");

            // --- MESSAGES (BUG TOPIC) ---
            Message m4 = createMessage(alice, general, "Messages sometimes appear in wrong order");
            m4.setTopic(bugTopic);

            Message m5 = createMessage(bob, general, "I noticed that too on mobile");
            m5.setTopic(bugTopic);

            // --- MESSAGES (FEATURE TOPIC – CLOSED) ---
            Message m6 = createMessage(bob, general, "Dark mode would be really useful");
            m6.setTopic(featureTopic);

            Message m7 = createMessage(alice, general, "Agree, especially at night");
            m7.setTopic(featureTopic);

            messageRepository.saveAll(List.of(m1, m2, m3, m4, m5, m6, m7));

            System.out.println("Demo data for chat + topics initialized.");
        };
    }

    private User getOrCreateUser(String first, String last, String username, String password) {
        return userRepository.findByUsername(username)
                .orElseGet(() -> {
                    User u = new User();
                    u.setFirstName(first);
                    u.setLastName(last);
                    u.setUsername(username);
                    u.setPassword(passwordEncoder.encode(password));
                    return userRepository.save(u);
                });
    }

    private ChatRoom getOrCreateGeneralRoom(User alice, User bob, User charlie) {
        Optional<ChatRoom> existing = chatRoomRepository.findByName("general");
        if (existing.isPresent()) return existing.get();

        return chatRoomService.createTeamRoom(
                "general",
                alice.getId(),
                List.of(bob.getId(), charlie.getId())
        );
    }

    private Message createMessage(User from, ChatRoom room, String content) {
        Message m = new Message();
        m.setFrom(from);
        m.setRoom(room);
        m.setContent(content);
        return m;
    }
}
