package com.nexorcrm.backend.repo;

import com.nexorcrm.backend.entity.RrqType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RrqTypeRepository extends JpaRepository<RrqType, Long> {
    List<RrqType> findByDeletedFalseOrderByCreatedAtDesc();
    Optional<RrqType> findByIdAndDeletedFalse(Long id);
    Optional<RrqType> findByTypeNameIgnoreCaseAndDeletedFalse(String typeName);
    boolean existsByTypeNameIgnoreCaseAndDeletedFalse(String typeName);
    boolean existsByTypeNameIgnoreCaseAndDeletedFalseAndIdNot(String typeName, Long id);
}
