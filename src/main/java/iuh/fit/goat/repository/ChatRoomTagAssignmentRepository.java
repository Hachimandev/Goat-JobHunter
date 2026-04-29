package iuh.fit.goat.repository;

import iuh.fit.goat.entity.ChatRoomTagAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomTagAssignmentRepository extends JpaRepository<ChatRoomTagAssignment, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT a FROM ChatRoomTagAssignment a
            WHERE a.room.roomId = :roomId AND a.account.accountId = :accountId
            """)
    Optional<ChatRoomTagAssignment> findByRoomIdAndAccountIdForUpdate(
            @Param("roomId") Long roomId,
            @Param("accountId") Long accountId
    );

    @Modifying
    @Query("DELETE FROM ChatRoomTagAssignment a WHERE a.tag.tagId = :tagId")
    void deleteByTagId(@Param("tagId") Long tagId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT a
        FROM ChatRoomTagAssignment a
        WHERE a.room.roomId IN :roomIds
        AND a.account.accountId = :accountId
    """)
    List<ChatRoomTagAssignment> findByRoomIdsAndAccountIdForUpdate(
            @Param("roomIds") List<Long> roomIds,
            @Param("accountId") Long accountId
    );

    @Query("""
        SELECT a.room.roomId
        FROM ChatRoomTagAssignment a
        WHERE a.tag.tagId = :tagId
        AND a.account.accountId = :accountId
    """)
    List<Long> findByTagIdAndAccountId(
            @Param("tagId") Long tagId,
            @Param("accountId") Long accountId
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT a
        FROM ChatRoomTagAssignment a
        WHERE a.account.accountId = :accountId
    """)
    List<ChatRoomTagAssignment> findByAccountIdForUpdate(@Param("accountId") Long accountId);
}

