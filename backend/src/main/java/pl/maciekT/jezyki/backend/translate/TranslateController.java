package pl.maciekT.jezyki.backend.translate;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.maciekT.jezyki.backend.translate.dto.TranslateRequest;
import pl.maciekT.jezyki.backend.translate.dto.TranslateResponse;

@RestController
@RequestMapping("/api/translate")
public class TranslateController {

    private final MyMemoryTranslateService service;

    public TranslateController(MyMemoryTranslateService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<TranslateResponse> translate(@RequestBody TranslateRequest req) {
        String translated = service.translate(req.getText(), req.getSource(), req.getTarget());
        return ResponseEntity.ok(new TranslateResponse(translated));
    }
}
