package com.nexorcrm.backend.repo;

import com.nexorcrm.backend.entity.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VendorRepository extends JpaRepository<Vendor, Long> {
    List<Vendor> findByDeletedFalseOrderByIdDesc();
}
