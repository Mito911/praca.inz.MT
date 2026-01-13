package pl.maciekT.jezyki.backend.translate;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.nio.charset.StandardCharsets;

@Service
public class MyMemoryTranslateService {

    private static final Logger log = LoggerFactory.getLogger(MyMemoryTranslateService.class);

    private final RestClient restClient = RestClient.create();

    public static class MyMemoryResponse {
        public ResponseData responseData;
        public String responseStatus;
        public String responseDetails;

        public static class ResponseData {
            public String translatedText;
        }
    }

    public String translate(String text, String source, String target) {
        if (text == null || text.trim().isEmpty()) {
            throw new IllegalArgumentException("text nie może być pusty");
        }

        String src = normalizeLang(source, "en").toUpperCase(); // EN
        String tgt = normalizeLang(target, "pl").toUpperCase(); // PL
        String langpair = src + "|" + tgt;                      // EN|PL

        // ✅ WAŻNE: build().encode(...) – wtedy '|' zostanie zakodowane do %7C
        URI uri = UriComponentsBuilder
                .fromHttpUrl("https://api.mymemory.translated.net/get")
                .queryParam("q", text.trim())
                .queryParam("langpair", langpair)
                .build()
                .encode(StandardCharsets.UTF_8)
                .toUri();

        log.info("MyMemory request: langpair={}, text='{}'", langpair, shorten(text.trim(), 120));
        log.debug("MyMemory URI: {}", uri);

        MyMemoryResponse resp;
        try {
            resp = restClient.get()
                    .uri(uri)
                    .retrieve()
                    .body(MyMemoryResponse.class);
        } catch (Exception ex) {
            log.warn("MyMemory call failed: {}", ex.getMessage());
            throw new RuntimeException("Błąd wywołania MyMemory: " + ex.getMessage());
        }

        if (resp != null && resp.responseDetails != null && !resp.responseDetails.isBlank()) {
            String details = resp.responseDetails.trim();
            if (details.toUpperCase().contains("INVALID LANGUAGE PAIR")) {
                log.warn("MyMemory invalid language pair. langpair={}, details={}", langpair, details);
                throw new RuntimeException("MyMemory: invalid language pair (langpair=" + langpair + "). " + details);
            }
        }

        if (resp == null || resp.responseData == null || resp.responseData.translatedText == null) {
            String status = (resp != null ? resp.responseStatus : null);
            String details = (resp != null ? resp.responseDetails : null);
            log.warn("MyMemory invalid response. status={}, details={}", status, details);
            throw new RuntimeException("Brak translatedText w odpowiedzi MyMemory");
        }

        String translated = resp.responseData.translatedText;
        log.info("MyMemory response: '{}'", shorten(translated, 120));
        return translated;
    }

    private String normalizeLang(String lang, String fallback) {
        if (lang == null) return fallback;
        String x = lang.trim().toLowerCase();
        if (!x.matches("^[a-z]{2}(-[a-z]{2})?$")) return fallback;
        return x;
    }

    private String shorten(String s, int max) {
        if (s == null) return null;
        if (s.length() <= max) return s;
        return s.substring(0, max) + "...";
    }
}