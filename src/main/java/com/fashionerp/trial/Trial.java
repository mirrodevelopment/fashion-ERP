package com.fashionerp.trial;

import com.fashionerp.customer.Customer;
import com.fashionerp.order.Order;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "trials")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Trial {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "trial_code", unique = true, nullable = false, length = 30)
    private String trialCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @Column(name = "order_code", length = 30)
    private String orderCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_mobile", nullable = false)
    private Customer customer;

    @Column(name = "customer_name", length = 150)
    private String customerName;

    @Column(name = "garment_type", nullable = false, length = 100)
    private String garmentType;

    @Column(length = 150)
    private String collection;

    @Column(name = "trial_date", nullable = false)
    @Builder.Default
    private LocalDate trialDate = LocalDate.now();

    @Column(name = "trial_time", length = 20)
    @Builder.Default
    private String trialTime = "11:00 AM";

    @Column(length = 50)
    @Builder.Default
    private String stage = "First Trial";

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "TODAY";

    @Column(name = "fit_status", nullable = false, length = 30)
    @Builder.Default
    private String fitStatus = "PENDING";

    @Column(name = "designer_name", length = 100)
    private String designerName;

    @Column(name = "delivery_date")
    private LocalDate deliveryDate;

    @Column(name = "neck_style", length = 100)
    private String neckStyle;

    @Column(name = "sleeve_style", length = 100)
    private String sleeveStyle;

    @Column(length = 100)
    private String lining;

    @Column(length = 100)
    private String embroidery;

    @Column(length = 150)
    private String fabric;

    @Column(name = "trial_attempt", nullable = false)
    @Builder.Default
    private Integer trialAttempt = 1;

    @Column(name = "alteration_count", nullable = false)
    @Builder.Default
    private Integer alterationCount = 0;

    @Column(name = "customer_feedback", columnDefinition = "TEXT")
    private String customerFeedback;

    @Column(name = "customer_rating")
    @Builder.Default
    private Integer customerRating = 5;

    @Column(name = "fit_preference", length = 50)
    @Builder.Default
    private String fitPreference = "Comfort / Regular Fit";

    @Column(name = "fit_checkpoints", columnDefinition = "TEXT")
    private String fitCheckpoints;

    @Column(name = "fit_notes", columnDefinition = "TEXT")
    private String fitNotes;

    @Column(name = "spec_notes", columnDefinition = "TEXT")
    private String specNotes;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @OneToMany(mappedBy = "trial", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TrialAlteration> alterations = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
