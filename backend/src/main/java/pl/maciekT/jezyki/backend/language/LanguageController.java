package pl.maciekT.jezyki.backend.language;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/languages")
@RequiredArgsConstructor
public class LanguageController {

    private final LanguageRepository repo;

    @GetMapping
    public List<LanguageDto> getAll() {
        return repo.findAll().stream().map(this::toDto).toList();
    }

    @GetMapping("/{id}")
    public LanguageDto getOne(@PathVariable Long id) {
        var lang = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        return toDto(lang);
    }

    @PostMapping
    public ResponseEntity<LanguageDto> create(@Valid @RequestBody CreateLanguageRequest req) {
        var code = req.code().trim().toLowerCase();
        if (repo.existsByCodeIgnoreCase(code)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Language code already exists");
        }
        var saved = repo.save(Language.builder()
                .code(code)
                .name(req.name().trim())
                .build());

        return ResponseEntity
                .created(URI.create("/api/languages/" + saved.getId()))
                .body(toDto(saved));
    }

    @PutMapping("/{id}")
    public LanguageDto update(@PathVariable Long id, @Valid @RequestBody CreateLanguageRequest req) {
        var lang = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        var newCode = req.code().trim().toLowerCase();
        if (!lang.getCode().equalsIgnoreCase(newCode) && repo.existsByCodeIgnoreCase(newCode)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Language code already exists");
        }

        lang.setCode(newCode);
        lang.setName(req.name().trim());
        return toDto(repo.save(lang));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        if (!repo.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        repo.deleteById(id);
    }

    private LanguageDto toDto(Language l) {
        return new LanguageDto(l.getId(), l.getCode(), l.getName());
    }
}
