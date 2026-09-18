package com.badminton.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendeeInfo {
    private Long memberId;
    private String memberName;
    private String memberColor;
    private Boolean isPaid;
}