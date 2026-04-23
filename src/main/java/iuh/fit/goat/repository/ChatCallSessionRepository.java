package iuh.fit.goat.repository;

import iuh.fit.goat.entity.ChatCallSession;
import iuh.fit.goat.enumeration.ChatCallSessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.Optional;

@Repository
public interface ChatCallSessionRepository extends JpaRepository<ChatCallSession, Long> {
    Optional<ChatCallSession> findByCallSessionIdAndDeletedAtIsNull(Long callSessionId);

    Optional<ChatCallSession> findFirstByChatRoomRoomIdAndStatusInAndDeletedAtIsNullOrderByCreatedAtDesc(
            Long chatRoomId,
            Collection<ChatCallSessionStatus> statuses
    );

    Optional<ChatCallSession> findFirstByChatRoomRoomIdAndDeletedAtIsNullOrderByCreatedAtDesc(Long chatRoomId);

    boolean existsByChatRoomRoomIdAndStatusInAndDeletedAtIsNull(
            Long chatRoomId,
            Collection<ChatCallSessionStatus> statuses
    );
}
