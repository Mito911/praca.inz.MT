package pl.maciekT.jezyki.backend.user.dto;

import pl.maciekT.jezyki.backend.user.UserRole;
import java.time.Instant;

public record UserDto(Long id, String email, UserRole role, Instant createdAt) {}
