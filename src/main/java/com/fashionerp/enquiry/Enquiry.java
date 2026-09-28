package com.fashionerp.enquiry;

import com.fashionerp.order.Order;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "enquiries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Enquiry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "enquiry_code", nullable = false, unique = true, length = 20)
    private String enquiryCode;

    @Column(name = "customer_name", nullable = false, length = 150)
    private String customerName;

    @Column(length = 30)
    private String phone;

    @Column(length = 150)
    private String email;

    @Column(name = "garment_type", length = 100)
    private String garmentType;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "PENDING";

    @Column(name = "assigned_to", length = 100)
    private String assignedTo;

    @Column(name = "follow_up_date")
    private LocalDate followUpDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "converted_order_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Order convertedOrder;

    @Column(length = 50)
    @Builder.Default
    private String source = "WALK_IN";

    @Column(length = 100)
    private String occasion;

    @Column(name = "preferred_date")
    private LocalDate preferredDate;

    @Column(name = "estimated_budget", precision = 12, scale = 2)
    private java.math.BigDecimal estimatedBudget;

    @Column(name = "next_action", length = 150)
    private String nextAction;

    @Column(name = "fabric_brought")
    @Builder.Default
    private Boolean fabricBrought = false;

    @Column(name = "avatar_url", length = 255)
    private String avatarUrl;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
