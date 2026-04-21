package iuh.fit.goat.repository;

import iuh.fit.goat.entity.ChatCallParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatCallParticipantRepository extends JpaRepository<ChatCallParticipant, Long> {
    Optional<ChatCallParticipant> findBySessionCallSessionIdAndAccountAccountIdAndDeletedAtIsNull(
            Long callSessionId,
            Long accountId
    );

    List<ChatCallParticipant> findBySessionCallSessionIdAndDeletedAtIsNull(Long callSessionId);
}
