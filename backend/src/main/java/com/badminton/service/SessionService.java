package com.badminton.service;

import com.badminton.dto.AttendeeInfo;
import com.badminton.dto.SessionRequest;
import com.badminton.dto.SessionResponse;
import com.badminton.dto.StatsResponse;
import com.badminton.model.Member;
import com.badminton.model.Session;
import com.badminton.model.SessionMember;
import com.badminton.model.SessionMemberId;
import com.badminton.repository.MemberRepository;
import com.badminton.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final SessionRepository sessionRepository;
    private final MemberRepository memberRepository;

    public List<SessionResponse> getSessions(String month) {
        List<Session> sessions;
        if (month != null && !month.isBlank()) {
            YearMonth ym = YearMonth.parse(month);
            sessions = sessionRepository.findBySessionDateBetweenOrderBySessionDateDescCreatedAtDesc(
                    ym.atDay(1), ym.atEndOfMonth()
            );
        } else {
            sessions = sessionRepository.findAllByOrderBySessionDateDescCreatedAtDesc();
        }
        return sessions.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public SessionResponse getSession(Long id) {
        Session session = sessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Session not found: " + id));
        return toResponse(session);
    }

    @Transactional
    public SessionResponse createSession(SessionRequest request) {
        Session session = Session.builder()
                .sessionDate(LocalDate.parse(request.getSessionDate()))
                .sessionTime(request.getSessionTime())
                .courtFee(request.getCourtFee())
                .shuttleFee(request.getShuttleFee())
                .totalCost(request.getCourtFee() + request.getShuttleFee())
                .note(request.getNote())
                .createdAt(LocalDateTime.now())
                .build();

        Session saved = sessionRepository.save(session);
        addSessionMembers(saved, request.getMemberIds());
        return toResponse(sessionRepository.findById(saved.getId()).orElseThrow());
    }

    @Transactional
    public SessionResponse updateSession(Long id, SessionRequest request) {
        Session session = sessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Session not found: " + id));

        session.setSessionDate(LocalDate.parse(request.getSessionDate()));
        session.setSessionTime(request.getSessionTime());
        session.setCourtFee(request.getCourtFee());
        session.setShuttleFee(request.getShuttleFee());
        session.setTotalCost(request.getCourtFee() + request.getShuttleFee());
        session.setNote(request.getNote());

        // Rebuild session members - preserve paid status for existing members
        List<Long> oldPaidMemberIds = session.getSessionMembers().stream()
                .filter(sm -> Boolean.TRUE.equals(sm.getIsPaid()))
                .map(sm -> sm.getMember().getId())
                .collect(Collectors.toList());

        session.getSessionMembers().clear();
        sessionRepository.save(session);

        addSessionMembersWithPaidStatus(session, request.getMemberIds(), oldPaidMemberIds);
        return toResponse(sessionRepository.findById(id).orElseThrow());
    }

    @Transactional
    public void deleteSession(Long id) {
        sessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Session not found: " + id));
        sessionRepository.deleteById(id);
    }

    @Transactional
    public SessionResponse togglePayment(Long sessionId, Long memberId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found: " + sessionId));

        SessionMember sm = session.getSessionMembers().stream()
                .filter(s -> s.getMember().getId().equals(memberId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Member not in this session"));

        boolean newStatus = !Boolean.TRUE.equals(sm.getIsPaid());
        sm.setIsPaid(newStatus);
        sm.setPaidAt(newStatus ? LocalDateTime.now() : null);
        sessionRepository.save(session);
        return toResponse(sessionRepository.findById(sessionId).orElseThrow());
    }

    public StatsResponse getStats() {
        List<Session> all = sessionRepository.findAll();
        double totalExpense = all.stream().mapToDouble(Session::getTotalCost).sum();
        double totalCollected = 0;
        double totalDebt = 0;

        for (Session s : all) {
            int count = s.getSessionMembers().size();
            if (count == 0) continue;
            double share = s.getTotalCost() / count;
            for (SessionMember sm : s.getSessionMembers()) {
                if (Boolean.TRUE.equals(sm.getIsPaid())) totalCollected += share;
                else totalDebt += share;
            }
        }

        return StatsResponse.builder()
                .totalSessions(all.size())
                .totalExpense(totalExpense)
                .totalCollected(totalCollected)
                .totalDebt(totalDebt)
                .build();
    }

    private void addSessionMembers(Session session, List<Long> memberIds) {
        addSessionMembersWithPaidStatus(session, memberIds, List.of());
    }

    private void addSessionMembersWithPaidStatus(Session session, List<Long> memberIds, List<Long> paidMemberIds) {
        for (Long memberId : memberIds) {
            Member member = memberRepository.findById(memberId)
                    .orElseThrow(() -> new RuntimeException("Member not found: " + memberId));
            SessionMemberId smId = new SessionMemberId(session.getId(), memberId);
            boolean wasPaid = paidMemberIds.contains(memberId);
            SessionMember sm = SessionMember.builder()
                    .id(smId)
                    .session(session)
                    .member(member)
                    .isPaid(wasPaid)
                    .paidAt(wasPaid ? LocalDateTime.now() : null)
                    .build();
            session.getSessionMembers().add(sm);
        }
        sessionRepository.save(session);
    }

    private SessionResponse toResponse(Session session) {
        List<AttendeeInfo> attendees = session.getSessionMembers().stream()
                .map(sm -> AttendeeInfo.builder()
                        .memberId(sm.getMember().getId())
                        .memberName(sm.getMember().getName())
                        .memberColor(sm.getMember().getColor())
                        .isPaid(sm.getIsPaid())
                        .build())
                .collect(Collectors.toList());

        int attendeeCount = attendees.size();
        int paidCount = (int) attendees.stream().filter(AttendeeInfo::getIsPaid).count();
        double perPerson = attendeeCount > 0 ? session.getTotalCost() / attendeeCount : 0;

        return SessionResponse.builder()
                .id(session.getId())
                .sessionDate(session.getSessionDate())
                .sessionTime(session.getSessionTime())
                .courtFee(session.getCourtFee())
                .shuttleFee(session.getShuttleFee())
                .totalCost(session.getTotalCost())
                .note(session.getNote())
                .createdAt(session.getCreatedAt())
                .attendees(attendees)
                .paidCount(paidCount)
                .attendeeCount(attendeeCount)
                .perPersonCost(perPerson)
                .build();
    }
}