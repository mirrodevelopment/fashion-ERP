package com.fashionerp.workforce;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class EmployeeDto {

    @Getter
    @Setter
    public static class Request {
        private String name;
        private String phone;
        private String email;
        private String role;
        private String status;
        private LocalDate joinedDate;
        private String avatarUrl;
        private String specialization;
        private String notes;

        // V10 Workforce Department & Performance Metrics
        private String department;
        private BigDecimal salary;
        private String branch;
        private Integer workload;
        private Integer efficiency;
        private Integer completedMonth;
    }

    @Getter
    @Setter
    @Builder
    public static class Response {
        private UUID id;
        private String employeeCode;
        private String name;
        private String phone;
        private String email;
        private String role;
        private String status;
        private LocalDate joinedDate;
        private String avatarUrl;
        private String specialization;
        private String notes;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        // V10 Workforce Department & Performance Metrics
        private String department;
        private BigDecimal salary;
        private String branch;
        private Integer workload;
        private Integer efficiency;
        private Integer completedMonth;

        public static Response from(Employee emp) {
            return Response.builder()
                .id(emp.getId())
                .employeeCode(emp.getEmployeeCode())
                .name(emp.getName())
                .phone(emp.getPhone())
                .email(emp.getEmail())
                .role(emp.getRole())
                .status(emp.getStatus())
                .joinedDate(emp.getJoinedDate())
                .avatarUrl(emp.getAvatarUrl())
                .specialization(emp.getSpecialization())
                .notes(emp.getNotes())
                .department(emp.getDepartment())
                .salary(emp.getSalary())
                .branch(emp.getBranch())
                .workload(emp.getWorkload())
                .efficiency(emp.getEfficiency())
                .completedMonth(emp.getCompletedMonth())
                .createdAt(emp.getCreatedAt())
                .updatedAt(emp.getUpdatedAt())
                .build();
        }
    }
}
