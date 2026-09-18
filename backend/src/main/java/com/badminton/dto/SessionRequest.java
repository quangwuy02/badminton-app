package com.badminton.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class SessionRequest {
    @NotNull(message = "Session date is required")
    private String sessionDate;

    private String sessionTime;

    @NotNull(message = "Court fee is required")
    private Double courtFee;

    @NotNull(message = "Shuttle fee is required")
    private Double shuttleFee;

    private String note;

    @NotEmpty(message = "At least one member is required")
    private List<Long> memberIds;
}