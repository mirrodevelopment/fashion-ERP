package com.fashionerp.customer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerNoteRepository extends JpaRepository<CustomerNote, UUID> {
    List<CustomerNote> findByCompanyIdAndCustomerMobileOrderByCreatedAtDesc(UUID companyId, String customerMobile);
    List<CustomerNote> findByCustomerMobileOrderByCreatedAtDesc(String customerMobile);
    Optional<CustomerNote> findByIdAndCompanyId(UUID id, UUID companyId);
    void deleteByIdAndCompanyId(UUID id, UUID companyId);
}

