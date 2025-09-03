package pl.maciekT.jezyki.backend.entry;

import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import pl.maciekT.jezyki.backend.language.Language;
import pl.maciekT.jezyki.backend.language.LanguageRepository;
import pl.maciekT.jezyki.backend.category.Category;
import pl.maciekT.jezyki.backend.category.CategoryRepository;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/entries")
public class EntryController {

    private final EntryRepository entries;
    private final LanguageRepository languages;
    private final CategoryRepository categories;

    public EntryController(EntryRepository entries, LanguageRepository languages, CategoryRepository categories) {
        this.entries = entries;
        this.languages = languages;
        this.categories = categories;
    }

    // ---- LISTA z filtrowaniem i paginacją ----
    @GetMapping
    public Page<EntryDto> list(
            @RequestParam(required = false) Long languageId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) List<String> tags, // ?tags=a1&tags=travel lub ?tags=a1,travel
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id,desc") String sort
    ) {
        Pageable pageable = PageRequest.of(page, size, parseSort(sort));

        String tagsCsv = normalizeTagsToCsv(tags);
        Page<Entry> p = entries.search(languageId, categoryId, emptyToNull(q), emptyToNull(tagsCsv), pageable);
        return p.map(this::toDto);
    }

    // ---- GET ONE ----
    @GetMapping("/{id}")
    public EntryDto getOne(@PathVariable Long id) {
        var e = entries.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        return toDto(e);
    }

    // ---- CREATE ----
    @PostMapping
    public ResponseEntity<EntryDto> create(@Valid @RequestBody CreateEntryRequest req) {
        Language lang = languages.findById(req.languageId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "languageId not found"));

        Category cat = null;
        if (req.categoryId() != null) {
            cat = categories.findById(req.categoryId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "categoryId not found"));
            if (!cat.getLanguage().getId().equals(lang.getId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category must belong to selected language");
            }
        }

        var e = Entry.builder()
                .language(lang)
                .category(cat)
                .term(req.term().trim())
                .translation(trimOrNull(req.translation()))
                .ipa(trimOrNull(req.ipa()))
                .partOfSpeech(trimOrNull(req.partOfSpeech()))
                .example(trimOrNull(req.example()))
                .tags(normalizeTagsToCsv(req.tags()))
                .cefr(trimOrNull(req.cefr()))
                .ownerUserId(req.ownerUserId())
                .isPublic(Boolean.TRUE.equals(req.isPublic()))
                .build();

        var saved = entries.save(e);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(saved));
    }

    // ---- UPDATE ----
    @PutMapping("/{id}")
    public EntryDto update(@PathVariable Long id, @Valid @RequestBody UpdateEntryRequest req) {
        var e = entries.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        // language (opcjonalna zmiana)
        Language lang = e.getLanguage();
        if (req.languageId() != null && !req.languageId().equals(e.getLanguage().getId())) {
            lang = languages.findById(req.languageId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "languageId not found"));
            e.setLanguage(lang);
        }

        // category (opcjonalna zmiana)
        if (req.categoryId() != null || (req.categoryId() == null && e.getCategory() != null)) {
            Category cat = null;
            if (req.categoryId() != null) {
                cat = categories.findById(req.categoryId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "categoryId not found"));
                if (!cat.getLanguage().getId().equals(lang.getId())) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category must belong to selected language");
                }
            }
            e.setCategory(cat);
        }

        if (req.term() != null) e.setTerm(req.term().trim());
        if (req.translation() != null) e.setTranslation(trimOrNull(req.translation()));
        if (req.ipa() != null) e.setIpa(trimOrNull(req.ipa()));
        if (req.partOfSpeech() != null) e.setPartOfSpeech(trimOrNull(req.partOfSpeech()));
        if (req.example() != null) e.setExample(trimOrNull(req.example()));
        if (req.tags() != null) e.setTags(normalizeTagsToCsv(req.tags()));
        if (req.cefr() != null) e.setCefr(trimOrNull(req.cefr()));
        if (req.ownerUserId() != null) e.setOwnerUserId(req.ownerUserId());
        if (req.isPublic() != null) e.setPublic(req.isPublic());

        return toDto(entries.save(e));
    }

    // ---- DELETE ----
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        if (!entries.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        entries.deleteById(id);
    }

    // ---- helpers ----
    private EntryDto toDto(Entry e) {
        return new EntryDto(
                e.getId(),
                e.getLanguage() != null ? e.getLanguage().getId() : null,
                e.getCategory() != null ? e.getCategory().getId() : null,
                e.getTerm(),
                e.getTranslation(),
                e.getIpa(),
                e.getPartOfSpeech(),
                e.getExample(),
                csvToList(e.getTags()),
                e.getCefr(),
                e.getOwnerUserId(),
                e.isPublic(),
                e.getCreatedAt()
        );
    }

    private static String trimOrNull(String s) {
        if (s == null) return null;
        var t = s.trim();
        return t.isEmpty() ? null : t;
    }

    private static String normalizeTagsToCsv(List<String> tags) {
        if (tags == null || tags.isEmpty()) return null;
        var cleaned = tags.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .map(String::toLowerCase)
                .filter(t -> !t.isEmpty())
                .distinct()
                .toList();
        return cleaned.isEmpty() ? null : String.join(",", cleaned);
    }

    private static List<String> csvToList(String csv) {
        if (csv == null || csv.isBlank()) return List.of();
        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    private static Sort parseSort(String sort) {
        // format: "field,asc" lub "field,desc" lub wiele: "field1,asc;field2,desc"
        if (sort == null || sort.isBlank()) return Sort.by(Sort.Direction.DESC, "id");
        var orders = new ArrayList<Sort.Order>();
        for (var part : sort.split(";")) {
            var bits = part.split(",");
            var prop = bits[0].trim();
            var dir = (bits.length > 1 ? bits[1].trim() : "asc");
            orders.add(new Sort.Order("desc".equalsIgnoreCase(dir) ? Sort.Direction.DESC : Sort.Direction.ASC, prop));
        }
        return Sort.by(orders);
    }

    private static String emptyToNull(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }
}
