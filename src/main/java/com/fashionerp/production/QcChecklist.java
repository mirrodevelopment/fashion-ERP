package com.fashionerp.production;

import com.fashionerp.order.Order;
import com.fashionerp.workforce.Employee;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "qc_checklists")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QcChecklist {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "order_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"customer", "progressStages", "hibernateLazyInitializer", "handler"})
    private Order order;

    @Column(name = "check_point", nullable = false, length = 200)
    private String checkPoint;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String result = "PENDING";

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "checked_by")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Employee checkedBy;

    @Column(name = "checked_at")
    private LocalDateTime checkedAt;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;
}
