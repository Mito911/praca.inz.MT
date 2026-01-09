package pl.maciekT.jezyki.backend.test.history;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

import pl.maciekT.jezyki.backend.test.TestDirection;
import pl.maciekT.jezyki.backend.test.TestMode;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "test_history")
public class TestHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long languageId;

    @Column
    private Long categoryId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TestMode mode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TestDirection direction;

    @Column(nullable = false)
    private int total;

    @Column(nullable = false)
    private int correct;
}


