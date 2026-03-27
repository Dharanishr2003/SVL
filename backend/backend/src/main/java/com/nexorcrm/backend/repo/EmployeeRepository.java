package com.nexorcrm.backend.repo;

import com.nexorcrm.backend.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    List<Employee> findByDeletedFalseOrderByIdDesc();
    Employee findFirstByNameIgnoreCaseAndDeletedFalse(String name);
    Optional<Employee> findFirstByEmailIgnoreCaseAndDeletedFalse(String email);
}
