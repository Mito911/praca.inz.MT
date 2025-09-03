package pl.maciekT.jezyki.backend.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateCategoryRequest(
        @NotNull Long languageId,
        Long parentId,
        @NotBlank @Size(max = 120) String name
) {}
