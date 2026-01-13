package pl.maciekT.jezyki.backend.translate.dto;

public class TranslateRequest {
    private String text;
    private String source; // np. "en"
    private String target; // np. "pl"

    public TranslateRequest() {}

    public TranslateRequest(String text, String source, String target) {
        this.text = text;
        this.source = source;
        this.target = target;
    }

    public String getText() { return text; }
    public String getSource() { return source; }
    public String getTarget() { return target; }

    public void setText(String text) { this.text = text; }
    public void setSource(String source) { this.source = source; }
    public void setTarget(String target) { this.target = target; }
}
