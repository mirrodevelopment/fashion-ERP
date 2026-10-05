package com.fashionerp.production;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface QcChecklistRepository extends JpaRepository<QcChecklist, UUID> {

    long countByResult(String result);
}
