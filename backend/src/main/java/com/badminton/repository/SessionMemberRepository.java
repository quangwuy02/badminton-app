package com.badminton.repository;

import com.badminton.model.SessionMember;
import com.badminton.model.SessionMemberId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SessionMemberRepository extends JpaRepository<SessionMember, SessionMemberId> {
    @Query("SELECT sm FROM SessionMember sm WHERE sm.id.memberId = :memberId")
    List<SessionMember> findByMemberId(@Param("memberId") Long memberId);
}