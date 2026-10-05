package com.fashionerp.collection;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "collections")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Collection {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "company_id", nullable = false)
    private UUID companyId;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, unique = true, length = 150)
    private String name;

    @Column(length = 250)
    private String subtitle;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String season;

    private Integer year;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String status = "ACTIVE";

    @Column(length = 100)
    private String designer;

    @Column(length = 100)
    private String branch;

    @Column(name = "launch_date")
    private LocalDate launchDate;

    @Column(name = "production_deadline")
    private LocalDate productionDeadline;

    @Column(name = "progress_percentage")
    @Builder.Default
    private Integer progressPercentage = 0;

    @Column(name = "design_progress")
    @Builder.Default
    private Integer designProgress = 0;

    @Column(name = "materials_progress")
    @Builder.Default
    private Integer materialsProgress = 0;

    @Column(name = "production_progress")
    @Builder.Default
    private Integer productionProgress = 0;

    @Column(name = "qc_progress")
    @Builder.Default
    private Integer qcProgress = 0;

    @Column(name = "is_featured", nullable = false)
    @Builder.Default
    private Boolean isFeatured = false;

    @Column(name = "cover_image_url", columnDefinition = "TEXT")
    private String coverImageUrl;

    @Column(name = "thumbnail_urls", columnDefinition = "TEXT")
    private String thumbnailUrls;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void assignTenant() {
        if (this.companyId == null) {
            this.companyId = com.fashionerp.common.TenantContext.getCompanyId();
        }
    }
}
