package iuh.fit.goat.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.FilterDef;

import static jakarta.persistence.FetchType.LAZY;

@Entity
@Table(
    name = "chat_room_tag_assignments",
    uniqueConstraints = {
        @UniqueConstraint(
                name = "uk_chat_room_tag_assignments_room_account",
                columnNames = {"room_id", "account_id"}
        )
    },
    indexes = {
        @Index(name = "idx_chat_room_tag_assignments_room_id", columnList = "room_id"),
        @Index(name = "idx_chat_room_tag_assignments_account_id", columnList = "account_id"),
        @Index(name = "idx_chat_room_tag_assignments_tag_id", columnList = "tag_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FilterDef(name = "activeChatRoomTagAssignmentFilter")
public class ChatRoomTagAssignment extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long assignmentId;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private ChatRoom room;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "tag_id", nullable = false)
    private Tag tag;
}

