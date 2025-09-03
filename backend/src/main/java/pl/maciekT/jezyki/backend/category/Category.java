package pl.maciekT.jezyki.backend.category;

import jakarta.persistence.*;
import lombok.*;
import pl.maciekT.jezyki.backend.language.Language;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity
@Table(name = "categories")
public class Category {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "language_id", nullable = false)
    private Language language;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Category parent;

    @Column(length = 120, nullable = false)
    private String name;

    @PrePersist @PreUpdate
    void normalize() {
        if (name != null) name = name.trim();
    }
}
