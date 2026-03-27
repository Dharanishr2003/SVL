package com.nexorcrm.backend.repo;

import com.nexorcrm.backend.entity.Rrq;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RrqRepository extends JpaRepository<Rrq, Long> {
    List<Rrq> findByDeletedFalseOrderByCreatedAtDesc();
    Optional<Rrq> findByIdAndDeletedFalse(Long id);
    boolean existsByRrqNameIgnoreCaseAndDeletedFalse(String rrqName);
    boolean existsByRrqNameIgnoreCaseAndDeletedFalseAndIdNot(String rrqName, Long id);
}
