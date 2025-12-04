package com.tech.api.configuration;

import com.tech.api.entity.ChatRoom;
import com.tech.api.entity.Message;
import com.tech.api.entity.Tag;
import com.tech.api.entity.User;
import com.tech.api.repository.MessageRepository;
import com.tech.api.repository.UserRepository;
import com.tech.api.service.ChatRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
import java.util.List;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository userRepository;
    private final MessageRepository messageRepository;
    private final PasswordEncoder passwordEncoder;
    private final ChatRoomService chatRoomService;

    @Bean
    public ApplicationRunner init() {
        return args -> {

            if (userRepository.count() > 0) return;

            User u1 = createUser("Alice", "Wonder", "alice", "password1");
            User u2 = createUser("Bob", "Marley", "bob", "password2");
            User u3 = createUser("Charlie", "Brown", "charlie", "password3");

            userRepository.saveAll(List.of(u1, u2, u3));

            ChatRoom general = chatRoomService.createRoom("general");
           
            Message m1 = createMessage(u1, general, "Hi Bob, how are you?");
            Message m2 = createMessage(u2, general, "Doing great, Alice!");
            Message m3 = createMessage(u3, general, "Hello Alice!");

            messageRepository.saveAll(List.of(m1, m2, m3));

            System.out.println("🔥 Initial demo data loaded.");
        };
    }

    private User createUser(String first, String last, String username, String password) {
        User u = new User();
        u.setFirstName(first);
        u.setLastName(last);
        u.setUsername(username);
        u.setPassword(passwordEncoder.encode(password));
        return u;
    }

    private Message createMessage(User from, ChatRoom room, String content) {
        Message m = new Message();
        m.setFrom(from);
        m.setRoom(room);
        m.setContent(content);
        return m;
    }

}

