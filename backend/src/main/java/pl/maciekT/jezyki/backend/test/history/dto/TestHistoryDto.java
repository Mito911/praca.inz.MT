package pl.maciekT.jezyki.backend.test.history.dto;

import pl.maciekT.jezyki.backend.test.TestDirection;
import pl.maciekT.jezyki.backend.test.TestMode;

import java.time.Instant;

public record TestHistoryDto(
        Long id,
        Instant createdAt,
        Long userId,
        Long languageId,
        Long categoryId,
        TestMode mode,
        TestDirection direction,
        int total,
        int correct
) {}
