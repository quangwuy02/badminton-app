package com.badminton.model;

import jakarta.persistence.Embeddable;
import lombok.*;
import java.io.Serializable;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class SessionMemberId implements Serializable {
    private Long sessionId;
    private Long memberId;
}