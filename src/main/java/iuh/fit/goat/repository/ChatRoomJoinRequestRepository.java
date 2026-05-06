package iuh.fit.goat.repository;

import iuh.fit.goat.entity.ChatRoomJoinRequest;
import iuh.fit.goat.enumeration.ChatRoomJoinRequestStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomJoinRequestRepository extends JpaRepository<ChatRoomJoinRequest, Long> {
    Optional<ChatRoomJoinRequest> findByRoomRoomIdAndAccountAccountIdAndStatusAndDeletedAtIsNull(
            Long roomId,
            Long accountId,
            ChatRoomJoinRequestStatus status
    );

    @EntityGraph(attributePaths = {"account"})
    List<ChatRoomJoinRequest> findByRoomRoomIdAndStatusAndDeletedAtIsNullOrderByRequestedAtAscRequestIdAsc(
            Long roomId,
            ChatRoomJoinRequestStatus status
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @EntityGraph(attributePaths = {"account", "room"})
    @Query("""
            SELECT req FROM ChatRoomJoinRequest req
            WHERE req.requestId = :requestId
              AND req.room.roomId = :roomId
              AND req.deletedAt IS NULL
            """)
    Optional<ChatRoomJoinRequest> findByIdAndRoomIdForUpdate(
            @Param("requestId") Long requestId,
            @Param("roomId") Long roomId
    );
}
