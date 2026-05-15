package iuh.fit.goat.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import iuh.fit.goat.enumeration.ReminderRepeatType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import static jakarta.persistence.CascadeType.*;
import static jakarta.persistence.CascadeType.REMOVE;
import static jakarta.persistence.FetchType.LAZY;

@Entity
@Table(
    name = "reminders",
    indexes = {
        @Index(name = "idx_reminders_creator_deleted", columnList = "creator_id, deleted_at"),
        @Index(name = "idx_reminders_chat_room_deleted", columnList = "chat_room_id, deleted_at"),
        @Index(name = "idx_reminders_next_trigger_active", columnList = "next_trigger_time, active, deleted_at")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FilterDef(name = "activeReminderFilter")
@ToString(exclude = {"creator", "chatRoom", "participants"})
public class Reminder extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "reminder_id")
    private Long reminderId;
    private String title;
    private String content;
    private Instant reminderTime;
    private Instant nextTriggerTime;
    private Instant lastTriggeredAt;
    private boolean allowResponse = true;
    private boolean active = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "repeat_type", nullable = false, length = 32)
    private ReminderRepeatType repeatType = ReminderRepeatType.NONE;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private Account creator;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "chat_room_id")
    private ChatRoom chatRoom;

    @OneToMany(mappedBy = "reminder", fetch = LAZY, cascade = {PERSIST, MERGE, REMOVE})
    @JsonIgnore
    @Filter(
            name = "activeReminderParticipantFilter",
            condition = "deleted_at IS NULL"
    )
    private List<ReminderParticipant> participants = new ArrayList<>();
}

