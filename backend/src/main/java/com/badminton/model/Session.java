package com.badminton.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Session {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_date", nullable = false)
    private LocalDate sessionDate;

    @Column(name = "session_time", length = 10)
    private String sessionTime;

    @Column(name = "court_fee", nullable = false)
    @Builder.Default
    private Double courtFee = 0.0;

    @Column(name = "shuttle_fee", nullable = false)
    @Builder.Default
    private Double shuttleFee = 0.0;

    @Column(name = "total_cost", nullable = false)
    @Builder.Default
    private Double totalCost = 0.0;

    @Column(length = 255)
    private String note;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<SessionMember> sessionMembers = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        totalCost = (courtFee == null ? 0 : courtFee) + (shuttleFee == null ? 0 : shuttleFee);
    }
}