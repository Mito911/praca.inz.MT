package pl.maciekT.jezyki.backend.user;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DefaultAdminSeeder {

    @Bean
    CommandLineRunner seedAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            String email = "admin@example.com";
            String rawPassword = "admin123";

            userRepository.findByEmailIgnoreCase(email).orElseGet(() -> {
                User u = new User();
                u.setEmail(email);
                u.setPasswordHash(passwordEncoder.encode(rawPassword));
                u.setRole(UserRole.ADMIN);
                return userRepository.save(u);
            });

            System.out.println("✅ Admin ensured: " + email + " / " + rawPassword);
        };
    }
}
