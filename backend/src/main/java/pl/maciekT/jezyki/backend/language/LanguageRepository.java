package pl.maciekT.jezyki.backend.language;

import org.springframework.data.jpa.repository.JpaRepository;

public interface LanguageRepository extends JpaRepository<Language, Long> {
    boolean existsByCodeIgnoreCase(String code);
}
