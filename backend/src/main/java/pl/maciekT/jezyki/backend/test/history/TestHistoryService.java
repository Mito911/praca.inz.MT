package pl.maciekT.jezyki.backend.test.history;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import pl.maciekT.jezyki.backend.test.history.dto.TestHistoryCreateRequest;
import pl.maciekT.jezyki.backend.test.history.dto.TestHistoryDto;

import java.time.Instant;
import java.util.List;

@Service
public class TestHistoryService {

    private final TestHistoryRepository repo;

    public TestHistoryService(TestHistoryRepository repo) {
        this.repo = repo;
    }

    public TestHistoryDto save(TestHistoryCreateRequest req) {
        if (req.userId() == null) throw new IllegalArgumentException("userId is required");
        if (req.languageId() == null) throw new IllegalArgumentException("languageId is required");
        if (req.mode() == null) throw new IllegalArgumentException("mode is required");
        if (req.direction() == null) throw new IllegalArgumentException("direction is required");
        if (req.total() <= 0) throw new IllegalArgumentException("total must be > 0");
        if (req.correct() < 0) throw new IllegalArgumentException("correct must be >= 0");

        TestHistory h = TestHistory.builder()
                .createdAt(Instant.now())
                .userId(req.userId())
                .languageId(req.languageId())
                .categoryId(req.categoryId())
                .mode(req.mode())
                .direction(req.direction())
                .total(req.total())
                .correct(req.correct())
                .build();

        return toDto(repo.save(h));
    }

    public List<TestHistoryDto> lastMine(Long userId, int limit) {
        int safeLimit = Math.max(1, Math.min(100, limit));
        var page = PageRequest.of(0, safeLimit);
        return repo.findByUserIdOrderByCreatedAtDesc(userId, page).stream()
                .map(this::toDto)
                .toList();
    }

    private TestHistoryDto toDto(TestHistory h) {
        return new TestHistoryDto(
                h.getId(),
                h.getCreatedAt(),
                h.getUserId(),
                h.getLanguageId(),
                h.getCategoryId(),
                h.getMode(),
                h.getDirection(),
                h.getTotal(),
                h.getCorrect()
        );
    }
}

