package iuh.fit.goat.entity;

import iuh.fit.goat.enumeration.ChatRoomJoinRequestStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.FilterDef;

import java.time.Instant;

import static jakarta.persistence.FetchType.LAZY;

@Entity
@Table(
        name = "chat_room_join_requests",
        indexes = {
                @Index(name = "idx_crjr_room_status", columnList = "room_id, status"),
                @Index(name = "idx_crjr_room_account_status", columnList = "room_id, account_id, status")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"room", "account", "processedBy"})
@FilterDef(name = "activeChatRoomJoinRequestFilter")
public class ChatRoomJoinRequest extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long requestId;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private ChatRoom room;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ChatRoomJoinRequestStatus status;

    @Column(nullable = false)
    private Instant requestedAt;

    private Instant respondedAt;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "processed_by")
    private Account processedBy;
}
