package com.fashionerp.production;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface QcChecklistRepository extends JpaRepository<QcChecklist, UUID> {

    long countByCompanyIdAndResult(UUID companyId, String result);

    @org.springframework.data.jpa.repository.Query("""
        SELECT COUNT(qc) FROM QcChecklist qc
        JOIN qc.order o
        WHERE (:companyId IS NULL OR qc.companyId = :companyId)
          AND qc.result = :result
          AND (:branch IS NULL OR o.branch = :branch
               OR o.branch IN (SELECT b.branchCode FROM Branch b WHERE b.name = :branch)
               OR o.branch IN (SELECT b.name FROM Branch b WHERE b.branchCode = :branch))
        """)
    long countByCompanyIdAndResultAndBranch(@org.springframework.data.repository.query.Param("companyId") UUID companyId,
                                            @org.springframework.data.repository.query.Param("result") String result,
                                            @org.springframework.data.repository.query.Param("branch") String branch);
}
