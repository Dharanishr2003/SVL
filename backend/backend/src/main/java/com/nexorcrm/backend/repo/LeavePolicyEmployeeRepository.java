package com.nexorcrm.backend.repo;

import com.nexorcrm.backend.entity.LeavePolicyEmployee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LeavePolicyEmployeeRepository extends JpaRepository<LeavePolicyEmployee, Long> {
    List<LeavePolicyEmployee> findByPolicy_Id(Long policyId);
    void deleteByPolicy_Id(Long policyId);
}
