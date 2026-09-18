package com.badminton.controller;

import com.badminton.dto.FundRequest;
import com.badminton.dto.FundResponse;
import com.badminton.service.FundService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/fund")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class FundController {

    private final FundService fundService;

    @GetMapping
    public ResponseEntity<FundResponse> getFund() {
        return ResponseEntity.ok(fundService.getFund());
    }

    @PostMapping("/add")
    public ResponseEntity<FundResponse> addFund(@Valid @RequestBody FundRequest request) {
        return ResponseEntity.ok(fundService.addFund(request));
    }

    @PostMapping("/withdraw")
    public ResponseEntity<FundResponse> withdrawFund(@Valid @RequestBody FundRequest request) {
        return ResponseEntity.ok(fundService.withdrawFund(request));
    }
}