package pl.maciekT.jezyki.backend.entry;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record EntryDto(
        Long id,
        Long languageId,
        Long categoryId,
        String term,
        String translation,
        String ipa,
        String partOfSpeech,
        String example,
        List<String> tags,   // API przyjemniejsze jako lista
        String cefr,
        UUID ownerUserId,
        boolean isPublic,
        LocalDateTime createdAt
) {}
