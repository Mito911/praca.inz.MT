package pl.maciekT.jezyki.backend.language;

import jakarta.persistence.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity
@Table(name = "languages", uniqueConstraints = @UniqueConstraint(columnNames = "code"))
public class Language {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 10, nullable = false, unique = true)
    private String code;   // np. "en", "pl"

    @Column(length = 50, nullable = false)
    private String name;   // np. "English", "Polski"

    @PrePersist
    @PreUpdate
    void normalize() {
        if (code != null) code = code.trim().toLowerCase();
        if (name != null) name = name.trim();
    }
}
