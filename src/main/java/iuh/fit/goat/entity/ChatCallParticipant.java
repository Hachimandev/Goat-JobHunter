package iuh.fit.goat.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.Instant;

import static jakarta.persistence.FetchType.LAZY;

@Entity
@Table(
        name = "chat_call_participants",
        indexes = {
                @Index(name = "idx_call_participants_session_deleted", columnList = "call_session_id, deleted_at"),
                @Index(name = "idx_call_participants_account_deleted", columnList = "account_id, deleted_at")
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_call_participant_session_account",
                        columnNames = {"call_session_id", "account_id"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"session", "account"})
public class ChatCallParticipant extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "participant_id")
    private Long participantId;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "call_session_id", nullable = false)
    private ChatCallSession session;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(name = "joined_at", nullable = false)
    private Instant joinedAt;

    @Column(name = "left_at")
    private Instant leftAt;

    @Column(name = "publisher", nullable = false)
    private boolean publisher = true;

        @Column(name = "declined", nullable = false)
        private boolean declined = false;
}
