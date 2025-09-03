package pl.maciekT.jezyki.backend.entry;

public record UpdateEntryRequest(
        Long languageId,
        Long categoryId,
        String term,
        String translation,
        String ipa,
        String partOfSpeech,
        String example,
        java.util.List<String> tags,
        String cefr,
        java.util.UUID ownerUserId,
        Boolean isPublic
) {}
