package com.nexorcrm.backend.repo;

import com.nexorcrm.backend.entity.Overtime;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OvertimeRepository extends JpaRepository<Overtime, Long> {
    List<Overtime> findByDeletedFalseOrderByIdDesc();
}
