package pl.maciekT.jezyki.backend.test.history.dto;

import pl.maciekT.jezyki.backend.test.TestDirection;
import pl.maciekT.jezyki.backend.test.TestMode;

public record TestHistoryCreateRequest(
        Long userId,
        Long languageId,
        Long categoryId,
        TestMode mode,
        TestDirection direction,
        int total,
        int correct
) {}

