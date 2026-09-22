package com.fashionerp.measurement;

import com.fashionerp.customer.Customer;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "measurement_profiles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MeasurementProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_mobile", nullable = false)
    private Customer customer;

    @Column(name = "garment_type", nullable = false, length = 100)
    private String garmentType;

    @Column(name = "recorded_by", length = 100)
    private String recordedBy;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<MeasurementPoint> points = new ArrayList<>();

    @Column(name = "recorded_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime recordedAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
