package com.fashionerp.trial;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface TrialAlterationRepository extends JpaRepository<TrialAlteration, UUID> {

    long countByCompletedFalse();
}
