package com.nexorcrm.backend.repo;

import com.nexorcrm.backend.entity.PriceListEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PriceListEntryRepository extends JpaRepository<PriceListEntry, Long> {
    List<PriceListEntry> findAllByOrderByIdDesc();
}
