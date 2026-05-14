package iuh.fit.goat.repository;

import iuh.fit.goat.entity.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReminderRepository extends JpaRepository<Reminder, Long>, JpaSpecificationExecutor<Reminder> {
    Optional<Reminder> findByReminderIdAndDeletedAtIsNull(Long reminderId);

    @Query("""
        SELECT r FROM Reminder r
        WHERE r.deletedAt IS NULL
        AND r.active = true
        AND r.nextTriggerTime <= :currentTime
        ORDER BY r.nextTriggerTime ASC
    """)
    List<Reminder> findDueReminders(@Param("currentTime") Instant currentTime);

    @Query("""
        SELECT r FROM Reminder r
        WHERE r.chatRoom.roomId = :chatRoomId
        AND r.deletedAt IS NULL
        ORDER BY r.nextTriggerTime ASC NULLS LAST
    """)
    List<Reminder> findByChatRoomId(@Param("chatRoomId") Long chatRoomId);
}

