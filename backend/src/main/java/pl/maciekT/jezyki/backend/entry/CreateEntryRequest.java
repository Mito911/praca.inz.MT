package pl.maciekT.jezyki.backend.entry;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

public record CreateEntryRequest(
        @NotNull Long languageId,
        Long categoryId,
        @NotBlank String term,
        String translation,
        @Size(max = 120) String ipa,
        @Size(max = 50) String partOfSpeech,
        String example,
        List<@Size(min = 1, max = 30) String> tags,
        @Pattern(regexp = "A1|A2|B1|B2|C1|C2", message = "CEFR must be one of A1,A2,B1,B2,C1,C2")
        String cefr,
        UUID ownerUserId,
        Boolean isPublic
) {}
