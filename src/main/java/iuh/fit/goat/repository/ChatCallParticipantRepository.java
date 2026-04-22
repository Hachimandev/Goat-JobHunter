package iuh.fit.goat.repository;

import iuh.fit.goat.entity.ChatCallParticipant;
import iuh.fit.goat.enumeration.ChatCallSessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChatCallParticipantRepository extends JpaRepository<ChatCallParticipant, Long> {
    Optional<ChatCallParticipant> findBySessionCallSessionIdAndAccountAccountIdAndDeletedAtIsNull(
            Long callSessionId,
            Long accountId
    );

        boolean existsByAccountAccountIdAndLeftAtIsNullAndDeletedAtIsNullAndSessionStatusInAndSessionDeletedAtIsNullAndSessionCallSessionIdNot(
            Long accountId,
            Collection<ChatCallSessionStatus> statuses,
            Long callSessionId
        );

    List<ChatCallParticipant> findBySessionCallSessionIdAndDeletedAtIsNull(Long callSessionId);
}
