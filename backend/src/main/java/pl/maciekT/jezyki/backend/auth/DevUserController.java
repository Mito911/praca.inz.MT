package pl.maciekT.jezyki.backend.auth;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import pl.maciekT.jezyki.backend.user.User;
import pl.maciekT.jezyki.backend.user.UserRepository;
import pl.maciekT.jezyki.backend.user.UserRole;

import java.util.Map;

@RestController
@RequestMapping("/api/dev")
public class DevUserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DevUserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/create-admin")
    public Map<String, String> createOrUpdateAdmin() {
        String email = "admin@example.com";
        String rawPassword = "admin123";

        User user = userRepository.findByEmailIgnoreCase(email).orElseGet(User::new);

        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setRole(UserRole.ADMIN);

        userRepository.save(user);

        return Map.of("email", email, "password", rawPassword);
    }
}
