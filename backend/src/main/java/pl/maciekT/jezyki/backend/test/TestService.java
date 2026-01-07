package pl.maciekT.jezyki.backend.test;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import pl.maciekT.jezyki.backend.entry.Entry;
import pl.maciekT.jezyki.backend.entry.EntryRepository;
import pl.maciekT.jezyki.backend.test.dto.TestGenerateRequest;
import pl.maciekT.jezyki.backend.test.dto.TestQuestionDto;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
public class TestService {

    private final EntryRepository entryRepository;

    public TestService(EntryRepository entryRepository) {
        this.entryRepository = entryRepository;
    }

    public List<TestQuestionDto> generate(TestGenerateRequest req) {
        if (req.getLanguageId() == null) throw new IllegalArgumentException("Brak languageId");
        if (req.getCount() <= 0) throw new IllegalArgumentException("count musi być > 0");
        if (req.getDirection() == null) req.setDirection(TestDirection.TERM_TO_TRANSLATION);

        List<Entry> candidates = switch (req.getMode()) {
            case ALL -> loadAll(req);
            case CATEGORY -> loadCategory(req);
            case DAY -> loadSince(req, 1);
            case WEEK -> loadSince(req, 7);
            case MONTH -> loadSince(req, 30);
            case LAST -> loadLast(req);
        };

        if (candidates.isEmpty()) throw new IllegalArgumentException("Brak słówek do testu dla wybranych kryteriów.");

        // losujemy N z listy
        Collections.shuffle(candidates);
        int take = Math.min(req.getCount(), candidates.size());
        candidates = candidates.subList(0, take);

        return candidates.stream().map(e -> {
            boolean t2t = req.getDirection() == TestDirection.TERM_TO_TRANSLATION;
            String prompt = t2t ? e.getTerm() : e.getTranslation();
            String expected = t2t ? e.getTranslation() : e.getTerm();
            return new TestQuestionDto(e.getId(), prompt, expected);
        }).toList();
    }

    private List<Entry> loadAll(TestGenerateRequest req) {
        // jeśli categoryId podany, też filtrujemy (wygodne)
        if (req.getCategoryId() != null) {
            return entryRepository.findByLanguageIdAndCategoryId(req.getLanguageId(), req.getCategoryId());
        }
        return entryRepository.findByLanguageId(req.getLanguageId());
    }

    private List<Entry> loadCategory(TestGenerateRequest req) {
        if (req.getCategoryId() == null) throw new IllegalArgumentException("W trybie CATEGORY wymagane categoryId");
        return entryRepository.findByLanguageIdAndCategoryId(req.getLanguageId(), req.getCategoryId());
    }

    private List<Entry> loadSince(TestGenerateRequest req, int days) {
        LocalDateTime after = LocalDateTime.now().minusDays(days);

        if (req.getCategoryId() != null) {
            return entryRepository.findByLanguageIdAndCategoryIdAndCreatedAtAfter(
                    req.getLanguageId(),
                    req.getCategoryId(),
                    after
            );
        }

        return entryRepository.findByLanguageIdAndCreatedAtAfter(req.getLanguageId(), after);
    }

    private List<Entry> loadLast(TestGenerateRequest req) {
        var page = PageRequest.of(0, Math.max(1, req.getCount()));
        if (req.getCategoryId() != null) {
            return entryRepository.findByLanguageIdAndCategoryIdOrderByCreatedAtDesc(req.getLanguageId(), req.getCategoryId(), page);
        }
        return entryRepository.findByLanguageIdOrderByCreatedAtDesc(req.getLanguageId(), page);
    }
}
