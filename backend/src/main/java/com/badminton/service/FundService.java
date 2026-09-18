package com.badminton.service;

import com.badminton.dto.FundRequest;
import com.badminton.dto.FundResponse;
import com.badminton.model.FundTransaction;
import com.badminton.repository.FundTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FundService {

    private final FundTransactionRepository fundTransactionRepository;

    public FundResponse getFund() {
        List<FundTransaction> transactions = fundTransactionRepository.findAllByOrderByCreatedAtDesc();
        double balance = transactions.stream()
                .mapToDouble(t -> "ADD".equals(t.getType()) ? t.getAmount() : -t.getAmount())
                .sum();
        return FundResponse.builder()
                .balance(balance)
                .transactions(transactions)
                .build();
    }

    @Transactional
    public FundResponse addFund(FundRequest request) {
        FundTransaction tx = FundTransaction.builder()
                .type("ADD")
                .amount(request.getAmount())
                .note(request.getNote())
                .createdAt(LocalDateTime.now())
                .build();
        fundTransactionRepository.save(tx);
        return getFund();
    }

    @Transactional
    public FundResponse withdrawFund(FundRequest request) {
        double currentBalance = getFund().getBalance();
        if (request.getAmount() > currentBalance) {
            throw new RuntimeException("Insufficient fund balance");
        }
        FundTransaction tx = FundTransaction.builder()
                .type("WITHDRAW")
                .amount(request.getAmount())
                .note(request.getNote())
                .createdAt(LocalDateTime.now())
                .build();
        fundTransactionRepository.save(tx);
        return getFund();
    }
}