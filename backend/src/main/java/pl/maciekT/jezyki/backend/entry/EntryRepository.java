package pl.maciekT.jezyki.backend.entry;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface EntryRepository extends JpaRepository<Entry, Long> {

    @Query(
            value = """
            SELECT * FROM entries e
            WHERE (:languageId IS NULL OR e.language_id = :languageId)
              AND (:categoryId IS NULL OR e.category_id = :categoryId)
              AND (
                    :q IS NULL OR
                    LOWER(e.term) LIKE LOWER(CONCAT('%', :q, '%')) OR
                    LOWER(e.translation) LIKE LOWER(CONCAT('%', :q, '%')) OR
                    LOWER(e.example) LIKE LOWER(CONCAT('%', :q, '%'))
                  )
              AND (
                    :tagsCsv IS NULL OR
                    EXISTS (
                        SELECT 1
                        FROM unnest(string_to_array(:tagsCsv, ',')) t
                        WHERE e.tags ILIKE CONCAT('%', t, '%')
                    )
                  )
            """,
            countQuery = """
            SELECT count(*) FROM entries e
            WHERE (:languageId IS NULL OR e.language_id = :languageId)
              AND (:categoryId IS NULL OR e.category_id = :categoryId)
              AND (
                    :q IS NULL OR
                    LOWER(e.term) LIKE LOWER(CONCAT('%', :q, '%')) OR
                    LOWER(e.translation) LIKE LOWER(CONCAT('%', :q, '%')) OR
                    LOWER(e.example) LIKE LOWER(CONCAT('%', :q, '%'))
                  )
              AND (
                    :tagsCsv IS NULL OR
                    EXISTS (
                        SELECT 1
                        FROM unnest(string_to_array(:tagsCsv, ',')) t
                        WHERE e.tags ILIKE CONCAT('%', t, '%')
                    )
                  )
            """,
            nativeQuery = true
    )
    Page<Entry> search(
            @Param("languageId") Long languageId,
            @Param("categoryId") Long categoryId,
            @Param("q") String q,
            @Param("tagsCsv") String tagsCsv,
            Pageable pageable
    );
}
