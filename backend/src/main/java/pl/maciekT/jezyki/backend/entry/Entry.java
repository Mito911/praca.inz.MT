package pl.maciekT.jezyki.backend.entry;

import jakarta.persistence.*;
import lombok.*;
import pl.maciekT.jezyki.backend.language.Language;
import pl.maciekT.jezyki.backend.category.Category;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity
@Table(name = "entries", indexes = {
        @Index(name = "idx_entries_language", columnList = "language_id"),
        @Index(name = "idx_entries_category", columnList = "category_id")
})
public class Entry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // relacje
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "language_id", nullable = false)
    private Language language;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category; // opcjonalna

    // pola
    @Column(columnDefinition = "text", nullable = false)
    private String term;

    @Column(columnDefinition = "text")
    private String translation;

    @Column(length = 120)
    private String ipa;

    @Column(name = "part_of_speech", length = 50)
    private String partOfSpeech;

    @Column(columnDefinition = "text")
    private String example;

    @Column(columnDefinition = "text")
    private String tags; // przechowujemy jako CSV w DB, np. "travel,airport,a1"

    @Column(length = 10)
    private String cefr; // np. A1..C2

    @Column(name = "owner_user_id")
    private UUID ownerUserId;

    @Column(name = "is_public", nullable = false)
    private boolean isPublic = false;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt; // DB ma default now()
}
