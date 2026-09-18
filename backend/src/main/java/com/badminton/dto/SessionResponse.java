package com.badminton.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionResponse {
    private Long id;
    private LocalDate sessionDate;
    private String sessionTime;
    private Double courtFee;
    private Double shuttleFee;
    private Double totalCost;
    private String note;
    private LocalDateTime createdAt;
    private List<AttendeeInfo> attendees;
    private int paidCount;
    private int attendeeCount;
    private Double perPersonCost;
}