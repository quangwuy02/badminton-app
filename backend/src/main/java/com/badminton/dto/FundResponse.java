package com.badminton.dto;

import com.badminton.model.FundTransaction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FundResponse {
    private Double balance;
    private List<FundTransaction> transactions;
}