package pl.maciekT.jezyki.backend.admin;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import pl.maciekT.jezyki.backend.user.User;
import pl.maciekT.jezyki.backend.user.UserRepository;
import pl.maciekT.jezyki.backend.user.UserRole;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminUserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    record UserDto(Long id, String email, UserRole role, String createdAt) {}
    record CreateUserRequest(String email, String password, UserRole role) {}
    record UpdateRoleRequest(UserRole role) {}
    record UpdatePasswordRequest(String password) {}

    @GetMapping
    public List<UserDto> getAll() {
        return userRepository.findAll().stream()
                .map(u -> new UserDto(u.getId(), u.getEmail(), u.getRole(), u.getCreatedAt().toString()))
                .toList();
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody CreateUserRequest req) {
        if (req.email() == null || req.email().isBlank() || req.password() == null || req.password().isBlank()) {
            return ResponseEntity.badRequest().body("Email i hasło są wymagane.");
        }
        if (userRepository.existsByEmail(req.email())) {
            return ResponseEntity.badRequest().body("Email already in use");
        }

        UserRole role = (req.role() == null) ? UserRole.USER : req.role();
        User user = new User(req.email().trim(), passwordEncoder.encode(req.password()), role);
        userRepository.save(user);

        return ResponseEntity.ok(new UserDto(user.getId(), user.getEmail(), user.getRole(), user.getCreatedAt().toString()));
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<?> updateRole(@PathVariable Long id, @RequestBody UpdateRoleRequest req) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();
        if (req.role() == null) return ResponseEntity.badRequest().body("Role is required");

        user.setRole(req.role());
        userRepository.save(user);

        return ResponseEntity.ok(new UserDto(user.getId(), user.getEmail(), user.getRole(), user.getCreatedAt().toString()));
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<?> resetPassword(@PathVariable Long id, @RequestBody UpdatePasswordRequest req) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();
        if (req.password() == null || req.password().isBlank()) {
            return ResponseEntity.badRequest().body("Password is required");
        }

        user.setPasswordHash(passwordEncoder.encode(req.password()));
        userRepository.save(user);

        return ResponseEntity.ok().build();
    }
}
