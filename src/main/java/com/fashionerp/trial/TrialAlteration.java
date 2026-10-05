package com.fashionerp.trial;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "trial_alterations")
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
    private String category = "Fit";

    @Column(nullable = false)
    private Boolean completed = false;

    @Column(name = "assigned_tailor", length = 100)
    private String assignedTailor;

    @Column(length = 20)
    private String priority = "Normal";

    @Column(name = "target_date")
    private LocalDate targetDate;

    @Column(name = "tailor_notes", columnDefinition = "TEXT")
    private String tailorNotes;

    @Column(nullable = false, length = 30)
    private String status = "PENDING";

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "completed_by", length = 100)
    private String completedBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public TrialAlteration() {
    }

    public TrialAlteration(UUID id, Trial trial, String description, String category, Boolean completed,
            String assignedTailor, String priority, LocalDate targetDate, String tailorNotes,
            String status, LocalDateTime completedAt, String completedBy, LocalDateTime createdAt) {
        this.id = id;
        this.trial = trial;
        this.description = description;
        this.category = category != null ? category : "Fit";
        this.completed = completed != null ? completed : false;
        this.assignedTailor = assignedTailor;
        this.priority = priority != null ? priority : "Normal";
        this.targetDate = targetDate;
        this.tailorNotes = tailorNotes;
        this.status = status != null ? status : "PENDING";
        this.completedAt = completedAt;
        this.completedBy = completedBy;
        this.createdAt = createdAt;
    }

    public static TrialAlterationBuilder builder() {
        return new TrialAlterationBuilder();
    }

    public static class TrialAlterationBuilder {
        private UUID id;
        private Trial trial;
        private String description;
        private String category = "Fit";
        private Boolean completed = false;
        private String assignedTailor;
        private String priority = "Normal";
        private LocalDate targetDate;
        private String tailorNotes;
        private String status = "PENDING";
        private LocalDateTime completedAt;
        private String completedBy;
        private LocalDateTime createdAt;

        TrialAlterationBuilder() {
        }

        public TrialAlterationBuilder id(UUID id) {
            this.id = id;
            return this;
        }

        public TrialAlterationBuilder trial(Trial trial) {
            this.trial = trial;
            return this;
        }

        public TrialAlterationBuilder description(String description) {
            this.description = description;
            return this;
        }

        public TrialAlterationBuilder category(String category) {
            this.category = category;
            return this;
        }

        public TrialAlterationBuilder completed(Boolean completed) {
            this.completed = completed;
            return this;
        }

        public TrialAlterationBuilder assignedTailor(String assignedTailor) {
            this.assignedTailor = assignedTailor;
            return this;
        }

        public TrialAlterationBuilder priority(String priority) {
            this.priority = priority;
            return this;
        }

        public TrialAlterationBuilder targetDate(LocalDate targetDate) {
            this.targetDate = targetDate;
            return this;
        }

        public TrialAlterationBuilder tailorNotes(String tailorNotes) {
            this.tailorNotes = tailorNotes;
            return this;
        }

        public TrialAlterationBuilder status(String status) {
            this.status = status;
            return this;
        }

        public TrialAlterationBuilder completedAt(LocalDateTime completedAt) {
            this.completedAt = completedAt;
            return this;
        }

        public TrialAlterationBuilder completedBy(String completedBy) {
            this.completedBy = completedBy;
            return this;
        }

        public TrialAlterationBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public TrialAlteration build() {
            return new TrialAlteration(id, trial, description, category, completed, assignedTailor,
                    priority, targetDate, tailorNotes, status, completedAt, completedBy, createdAt);
        }
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Trial getTrial() {
        return trial;
    }

    public void setTrial(Trial trial) {
        this.trial = trial;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Boolean getCompleted() {
        return completed;
    }

    public void setCompleted(Boolean completed) {
        this.completed = completed;
    }

    public String getAssignedTailor() {
        return assignedTailor;
    }

    public void setAssignedTailor(String assignedTailor) {
        this.assignedTailor = assignedTailor;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public LocalDate getTargetDate() {
        return targetDate;
    }

    public void setTargetDate(LocalDate targetDate) {
        this.targetDate = targetDate;
    }

    public String getTailorNotes() {
        return tailorNotes;
    }

    public void setTailorNotes(String tailorNotes) {
        this.tailorNotes = tailorNotes;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public String getCompletedBy() {
        return completedBy;
    }

    public void setCompletedBy(String completedBy) {
        this.completedBy = completedBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
