package com.badminton.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatsResponse {
    private int totalSessions;
    private Double totalExpense;
    private Double totalCollected;
    private Double totalDebt;
}