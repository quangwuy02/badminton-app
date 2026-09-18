package com.badminton.service;

import com.badminton.dto.MemberRequest;
import com.badminton.dto.MemberResponse;
import com.badminton.model.Member;
import com.badminton.model.Session;
import com.badminton.model.SessionMember;
import com.badminton.repository.MemberRepository;
import com.badminton.repository.SessionMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final SessionMemberRepository sessionMemberRepository;

    private static final String[] DEFAULT_COLORS = {
        "#4f46e5", "#059669", "#dc2626", "#d97706",
        "#7c3aed", "#0891b2", "#be185d", "#65a30d"
    };

    public List<MemberResponse> getAllMembers() {
        return memberRepository.findAllByOrderByCreatedAtAsc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public MemberResponse addMember(MemberRequest request) {
        String color = request.getColor();
        if (color == null || color.isBlank()) {
            long count = memberRepository.count();
            color = DEFAULT_COLORS[(int) (count % DEFAULT_COLORS.length)];
        }
        Member member = Member.builder()
                .name(request.getName().trim())
                .color(color)
                .createdAt(LocalDateTime.now())
                .build();
        return toResponse(memberRepository.save(member));
    }

    @Transactional
    public MemberResponse updateMember(Long id, MemberRequest request) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Member not found: " + id));
        member.setName(request.getName().trim());
        if (request.getColor() != null && !request.getColor().isBlank()) {
            member.setColor(request.getColor());
        }
        return toResponse(memberRepository.save(member));
    }

    @Transactional
    public void deleteMember(Long id) {
        memberRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Member not found: " + id));
        memberRepository.deleteById(id);
    }

    @Transactional
    public void markAllPaid(Long memberId) {
        List<SessionMember> sms = sessionMemberRepository.findByMemberId(memberId);
        sms.forEach(sm -> {
            if (!Boolean.TRUE.equals(sm.getIsPaid())) {
                sm.setIsPaid(true);
                sm.setPaidAt(LocalDateTime.now());
            }
        });
        sessionMemberRepository.saveAll(sms);
    }

    public MemberResponse toResponse(Member member) {
        List<SessionMember> sms = sessionMemberRepository.findByMemberId(member.getId());
        double totalDebt = sms.stream()
                .filter(sm -> !Boolean.TRUE.equals(sm.getIsPaid()))
                .mapToDouble(sm -> {
                    Session s = sm.getSession();
                    int count = s.getSessionMembers().size();
                    return count > 0 ? s.getTotalCost() / count : 0;
                })
                .sum();

        return MemberResponse.builder()
                .id(member.getId())
                .name(member.getName())
                .color(member.getColor())
                .createdAt(member.getCreatedAt())
                .totalDebt(totalDebt)
                .build();
    }
}