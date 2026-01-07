package pl.maciekT.jezyki.backend.test.dto;

import pl.maciekT.jezyki.backend.test.TestDirection;
import pl.maciekT.jezyki.backend.test.TestMode;

public class TestGenerateRequest {
    private TestMode mode;
    private Long languageId;
    private Long categoryId; // opcjonalne
    private int count;
    private TestDirection direction;

    public TestMode getMode() { return mode; }
    public void setMode(TestMode mode) { this.mode = mode; }

    public Long getLanguageId() { return languageId; }
    public void setLanguageId(Long languageId) { this.languageId = languageId; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public int getCount() { return count; }
    public void setCount(int count) { this.count = count; }

    public TestDirection getDirection() { return direction; }
    public void setDirection(TestDirection direction) { this.direction = direction; }


}
