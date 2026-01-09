package pl.maciekT.jezyki.backend.test.history;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TestHistoryRepository extends JpaRepository<TestHistory, Long> {
    List<TestHistory> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
}
