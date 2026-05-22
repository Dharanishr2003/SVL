package com.nexorcrm.backend.repo;

import com.nexorcrm.backend.entity.LeavePolicyEmployee;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LeavePolicyEmployeeRepository extends JpaRepository<LeavePolicyEmployee, Long> {
    List<LeavePolicyEmployee> findByPolicy_Id(Long policyId);

    @Modifying(flushAutomatically = true)
    @Query("delete from LeavePolicyEmployee e where e.policy.id = :policyId")
    void deleteByPolicyId(@Param("policyId") Long policyId);
}
