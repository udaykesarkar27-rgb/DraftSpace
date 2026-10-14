package com.example.blog.config;

import com.example.blog.entity.Post;
import com.example.blog.entity.Role;
import com.example.blog.entity.User;
import com.example.blog.repository.PostRepository;
import com.example.blog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

/** Creates the bootstrap admin (and optional demo content) on first start. */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.username}") private String adminUsername;
    @Value("${app.admin.email}") private String adminEmail;
    @Value("${app.admin.password}") private String adminPassword;
    @Value("${app.seed-demo-data}") private boolean seedDemo;

    @Override
    public void run(String... args) {
        User admin = userRepository.findByUsername(adminUsername).orElseGet(() -> {
            User u = new User();
            u.setUsername(adminUsername);
            u.setEmail(adminEmail);
            u.setPassword(passwordEncoder.encode(adminPassword));
            u.setRoles(Set.of(Role.ROLE_USER, Role.ROLE_ADMIN));
            log.info("Created bootstrap admin user '{}'", adminUsername);
            return userRepository.save(u);
        });

        if (seedDemo && postRepository.count() == 0) {
            postRepository.save(demo(admin, "Welcome to Fieldnotes", "Announcements",
                    "## Hello\n\nThis is a demo post written in **Markdown**. Register an account to write your own, "
                            + "or sign in as the admin to try the moderation tools.\n\n- Posts support headings, lists and code\n"
                            + "- Comments are open to every signed-in reader\n\n> Change the admin password before going live."));
            postRepository.save(demo(admin, "Writing a good first paragraph", "Writing",
                    "A strong opening answers one question: *why should I keep reading?*\n\n"
                            + "Lead with the most specific thing you know. Cut the warm-up. Then earn the second paragraph."));
        }
    }

    private Post demo(User author, String title, String category, String content) {
        Post p = new Post();
        p.setAuthor(author);
        p.setTitle(title);
        p.setCategory(category);
        p.setContent(content);
        return p;
    }
}
