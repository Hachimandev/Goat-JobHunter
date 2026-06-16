package iuh.fit.goat.entity;

import iuh.fit.goat.enumeration.ReminderRsvpStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.FilterDef;

import java.time.Instant;

import static jakarta.persistence.FetchType.LAZY;

@Entity
@Table(
    name = "reminder_participants",
    indexes = {
        @Index(name = "idx_reminder_participants_reminder_deleted", columnList = "reminder_id, deleted_at"),
        @Index(name = "idx_reminder_participants_account_deleted", columnList = "account_id, deleted_at")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_reminder_participant", columnNames = {"reminder_id", "account_id"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FilterDef(name = "activeReminderParticipantFilter")
@ToString(exclude = {"reminder", "account"})
public class ReminderParticipant extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "participant_id")
    private Long participantId;
    private Instant lastNotifiedAt;

    @Enumerated(EnumType.STRING)
    private ReminderRsvpStatus rsvpStatus = ReminderRsvpStatus.PENDING;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "reminder_id", nullable = false)
    private Reminder reminder;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;
}

