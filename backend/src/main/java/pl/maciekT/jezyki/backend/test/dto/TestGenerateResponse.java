package pl.maciekT.jezyki.backend.test.dto;

import java.util.List;

public class TestGenerateResponse {
    private List<TestQuestionDto> questions;
    private int totalAvailable;

    public TestGenerateResponse(List<TestQuestionDto> questions, int totalAvailable) {
        this.questions = questions;
        this.totalAvailable = totalAvailable;
    }

    public List<TestQuestionDto> getQuestions() { return questions; }
    public int getTotalAvailable() { return totalAvailable; }
}
