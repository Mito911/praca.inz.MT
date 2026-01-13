package pl.maciekT.jezyki.backend.translate.dto;

public class TranslateResponse {
    private String translatedText;

    public TranslateResponse() {}

    public TranslateResponse(String translatedText) {
        this.translatedText = translatedText;
    }

    public String getTranslatedText() {
        return translatedText;
    }

    public void setTranslatedText(String translatedText) {
        this.translatedText = translatedText;
    }
}
