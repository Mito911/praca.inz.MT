package pl.maciekT.jezyki.backend.test.dto;

public class TestQuestionDto {
    private Long entryId;
    private String prompt;   // co pokazujemy userowi
    private String expected; // poprawna odpowiedź (na razie po stronie FE liczymy wynik)

    public TestQuestionDto(Long entryId, String prompt, String expected) {
        this.entryId = entryId;
        this.prompt = prompt;
        this.expected = expected;
    }

    public Long getEntryId() { return entryId; }
    public String getPrompt() { return prompt; }
    public String getExpected() { return expected; }
}
