package pl.maciekT.jezyki.backend.category;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import pl.maciekT.jezyki.backend.language.LanguageRepository;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository repo;
    private final LanguageRepository langRepo;

    @GetMapping
    public List<CategoryDto> list(@RequestParam(required = false) Long languageId,
                                  @RequestParam(required = false) Long parentId) {
        List<Category> list;
        if (languageId != null && parentId != null) {
            list = repo.findByLanguage_IdAndParent_Id(languageId, parentId);
        } else if (languageId != null) {
            list = repo.findByLanguage_Id(languageId);
        } else if (parentId != null) {
            list = repo.findByParent_Id(parentId);
        } else {
            list = repo.findAll();
        }
        return list.stream().map(this::toDto).toList();
    }

    @GetMapping("/{id}")
    public CategoryDto get(@PathVariable Long id) {
        var c = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        return toDto(c);
    }

    @PostMapping
    public ResponseEntity<CategoryDto> create(@Valid @RequestBody CreateCategoryRequest req) {
        var lang = langRepo.findById(req.languageId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Language not found"));

        Category parent = null;
        if (req.parentId() != null) {
            parent = repo.findById(req.parentId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Parent category not found"));
            if (!parent.getLanguage().getId().equals(lang.getId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Parent belongs to different language");
            }
        }

        if (repo.existsByLanguage_IdAndNameIgnoreCase(lang.getId(), req.name().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Category already exists in this language");
        }

        var saved = repo.save(Category.builder()
                .language(lang)
                .parent(parent)
                .name(req.name().trim())
                .build());

        return ResponseEntity.created(URI.create("/api/categories/" + saved.getId())).body(toDto(saved));
    }

    @PutMapping("/{id}")
    public CategoryDto update(@PathVariable Long id, @Valid @RequestBody CreateCategoryRequest req) {
        var cat = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        var lang = langRepo.findById(req.languageId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Language not found"));

        Category parent = null;
        if (req.parentId() != null) {
            parent = repo.findById(req.parentId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Parent category not found"));
            if (!parent.getLanguage().getId().equals(lang.getId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Parent belongs to different language");
            }
        }

        if (repo.existsByLanguage_IdAndNameIgnoreCaseAndIdNot(lang.getId(), req.name().trim(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Category already exists in this language");
        }

        cat.setLanguage(lang);
        cat.setParent(parent);
        cat.setName(req.name().trim());
        return toDto(repo.save(cat));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        if (!repo.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        repo.deleteById(id);
    }

    private CategoryDto toDto(Category c) {
        return new CategoryDto(
                c.getId(),
                c.getLanguage() != null ? c.getLanguage().getId() : null,
                c.getParent() != null ? c.getParent().getId() : null,
                c.getName()
        );
    }
}
