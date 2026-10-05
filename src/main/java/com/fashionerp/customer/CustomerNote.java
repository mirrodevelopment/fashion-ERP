package com.fashionerp.customer;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "customer_notes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CustomerNote {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "company_id", nullable = false)
    private UUID companyId;

    @Column(name = "customer_mobile", nullable = false, length = 30)
    private String customerMobile;

    @Column(name = "note_text", nullable = false, columnDefinition = "TEXT")
    private String noteText;

    @Column(name = "author_name", nullable = false, length = 100)
    @Builder.Default
    private String authorName = "Atelier Staff";

    @Column(name = "author_badge", nullable = false, length = 10)
    @Builder.Default
    private String authorBadge = "AS";

    @Column(length = 50)
    @Builder.Default
    private String category = "GENERAL";

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void assignTenant() {
        if (this.companyId == null) {
            this.companyId = com.fashionerp.common.TenantContext.getCompanyId();
        }
    }
}
