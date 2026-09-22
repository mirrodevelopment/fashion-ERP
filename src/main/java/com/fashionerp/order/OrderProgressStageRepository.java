package com.fashionerp.order;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface OrderProgressStageRepository extends JpaRepository<OrderProgressStage, UUID> {}
