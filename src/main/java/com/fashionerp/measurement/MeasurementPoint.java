package com.fashionerp.measurement;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "measurement_points")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MeasurementPoint {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "company_id", nullable = false)
    private UUID companyId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    private MeasurementProfile profile;

    @Column(name = "point_name", nullable = false, length = 100)
    private String pointName;

    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal value;

    @Column(nullable = false, length = 10)
    @Builder.Default
    private String unit = "\"";

    @Column(name = "marker_index")
    private Integer markerIndex;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;

    @PrePersist
    protected void assignTenant() {
        if (this.companyId == null) {
            this.companyId = com.fashionerp.common.TenantContext.getCompanyId();
        }
    }
}
