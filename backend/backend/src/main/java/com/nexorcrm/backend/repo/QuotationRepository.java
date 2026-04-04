package com.nexorcrm.backend.repo;

import com.nexorcrm.backend.entity.Quotation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuotationRepository extends JpaRepository<Quotation, Long> {
    List<Quotation> findAllByOrderByCreatedAtDesc();
}
