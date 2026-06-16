package iuh.fit.goat.entity;

import iuh.fit.goat.enumeration.ChatCallEndReason;
import iuh.fit.goat.enumeration.ChatCallSessionStatus;
import iuh.fit.goat.enumeration.ChatCallType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import static jakarta.persistence.CascadeType.ALL;
import static jakarta.persistence.FetchType.LAZY;

@Entity
@Table(
        name = "chat_call_sessions",
        indexes = {
                @Index(name = "idx_call_sessions_room_status_deleted", columnList = "chat_room_id, status, deleted_at"),
                @Index(name = "idx_call_sessions_room_created", columnList = "chat_room_id, created_at")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"chatRoom", "initiator", "participants"})
public class ChatCallSession extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "call_session_id")
    private Long callSessionId;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "chat_room_id", nullable = false)
    private ChatRoom chatRoom;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "initiator_account_id", nullable = false)
    private Account initiator;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private ChatCallSessionStatus status;

    @Column(name = "agora_channel_name", nullable = false, length = 64)
    private String agoraChannelName;

    @Enumerated(EnumType.STRING)
    @Column(name = "call_type", nullable = false, length = 16)
    private ChatCallType callType;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "ended_at")
    private Instant endedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "end_reason", length = 64)
    private ChatCallEndReason endReason;

    @OneToMany(mappedBy = "session", fetch = LAZY, cascade = ALL, orphanRemoval = true)
    private List<ChatCallParticipant> participants = new ArrayList<>();
}
