package pl.maciekT.jezyki.backend.category;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByLanguage_Id(Long languageId);
    List<Category> findByParent_Id(Long parentId);
    List<Category> findByLanguage_IdAndParent_Id(Long languageId, Long parentId);

    boolean existsByLanguage_IdAndNameIgnoreCase(Long languageId, String name);
    boolean existsByLanguage_IdAndNameIgnoreCaseAndIdNot(Long languageId, String name, Long id);
}
