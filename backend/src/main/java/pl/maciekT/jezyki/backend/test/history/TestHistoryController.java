package pl.maciekT.jezyki.backend.test.history;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.maciekT.jezyki.backend.test.history.dto.TestHistoryCreateRequest;
import pl.maciekT.jezyki.backend.test.history.dto.TestHistoryDto;

import java.util.List;

@RestController
@RequestMapping("/api/tests")
public class TestHistoryController {

    private final TestHistoryService service;

    public TestHistoryController(TestHistoryService service) {
        this.service = service;
    }

    @PostMapping("/history")
    public ResponseEntity<TestHistoryDto> save(@RequestBody TestHistoryCreateRequest req) {
        return ResponseEntity.ok(service.save(req));
    }

    // najprościej: pobieramy po userId przesłanym z frontu
    @GetMapping("/history")
    public ResponseEntity<List<TestHistoryDto>> lastMine(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "20") int limit
    ) {
        return ResponseEntity.ok(service.lastMine(userId, limit));
    }
}


