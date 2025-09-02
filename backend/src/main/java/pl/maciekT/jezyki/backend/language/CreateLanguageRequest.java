package pl.maciekT.jezyki.backend.language;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateLanguageRequest(
        @NotBlank @Size(max = 10) String code,
        @NotBlank @Size(max = 50) String name
) { }
