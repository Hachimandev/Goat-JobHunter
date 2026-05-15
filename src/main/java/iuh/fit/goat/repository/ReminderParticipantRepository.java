package iuh.fit.goat.repository;

import iuh.fit.goat.entity.ReminderParticipant;
import iuh.fit.goat.enumeration.ReminderRsvpStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReminderParticipantRepository extends JpaRepository<ReminderParticipant, Long>, JpaSpecificationExecutor<ReminderParticipant>
{
    Optional<ReminderParticipant> findByReminder_ReminderIdAndAccount_AccountIdAndDeletedAtIsNull(Long reminderId, Long accountId);

    List<ReminderParticipant> findByReminder_ReminderIdAndDeletedAtIsNull(Long reminderId);

    List<ReminderParticipant> findByReminder_ReminderIdAndRsvpStatusAndDeletedAtIsNull(
            Long reminderId,
            ReminderRsvpStatus rsvpStatus
    );

    List<ReminderParticipant> findByAccount_AccountIdAndDeletedAtIsNull(Long accountId);
}

