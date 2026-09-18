package com.badminton.repository;

import com.badminton.model.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {
    List<Session> findAllByOrderBySessionDateDescCreatedAtDesc();

    List<Session> findBySessionDateBetweenOrderBySessionDateDescCreatedAtDesc(
        LocalDate startDate, LocalDate endDate
    );
}