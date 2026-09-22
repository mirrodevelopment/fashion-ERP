package com.fashionerp.trial;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "trial_alterations")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TrialAlteration {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trial_id", nullable = false)
    @JsonIgnore
    private Trial trial;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String category = "Fit";

    @Column(nullable = false)
    @Builder.Default
    private Boolean completed = false;

    @Column(name = "assigned_tailor", length = 100)
    private String assignedTailor;

    @Column(length = 20)
    @Builder.Default
    private String priority = "Normal";

    @Column(name = "target_date")
    private LocalDate targetDate;

    @Column(name = "tailor_notes", columnDefinition = "TEXT")
    private String tailorNotes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
