package pl.maciekT.jezyki.backend.test;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.maciekT.jezyki.backend.test.dto.TestGenerateRequest;
import pl.maciekT.jezyki.backend.test.dto.TestGenerateResponse;

@RestController
@RequestMapping("/api/tests")
public class TestController {

    private final TestService testService;

    public TestController(TestService testService) {
        this.testService = testService;
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generate(@RequestBody TestGenerateRequest req) {
        try {
            var questions = testService.generate(req);
            return ResponseEntity.ok(new TestGenerateResponse(questions, questions.size()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

