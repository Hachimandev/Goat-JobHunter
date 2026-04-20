package iuh.fit.goat.repository;

import iuh.fit.goat.entity.ChatMember;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatMemberRepository extends JpaRepository<ChatMember, Long> {
    List<ChatMember> findByRoomRoomIdAndDeletedAtIsNull(Long roomId);

        Page<ChatMember> findByDeletedAtIsNull(Pageable pageable);

    boolean existsByRoomRoomIdAndAccountAccountIdAndDeletedAtIsNull(Long roomId, Long accountId);

    @Query("""
            SELECT cm FROM ChatMember cm
            JOIN cm.room cr
            WHERE cm.account.accountId = :accountId
              AND cm.deletedAt IS NULL
              AND cr.deletedAt IS NULL
            ORDER BY COALESCE(cr.updatedAt, cr.createdAt) DESC, cr.roomId DESC
            """)
    Page<ChatMember> findPagedByAccountIdForUnread(
            @Param("accountId") Long accountId,
            Pageable pageable
    );

    @Query(
            "SELECT cm.lastReadMessageSk FROM ChatMember cm " +
            "WHERE cm.room.roomId = :roomId AND cm.account.accountId = :accountId AND cm.deletedAt IS NULL"
    )
    Optional<String> findLastReadMessageSk(@Param("roomId") Long roomId, @Param("accountId") Long accountId);

    @Modifying
    @Transactional
    @Query(
            "UPDATE ChatMember cm " +
            "SET cm.lastReadMessageSk = :messageSk " +
            "WHERE cm.room.roomId = :roomId AND cm.account.accountId = :accountId AND cm.deletedAt IS NULL"
    )
    void updateLastReadMessageId(
            @Param("roomId") Long roomId,
            @Param("accountId") Long accountId,
            @Param("messageSk") String messageSk
    );

    @Modifying
    @Transactional
    @Query(
            "UPDATE ChatMember cm " +
            "SET cm.unreadCount = cm.unreadCount + :delta " +
            "WHERE cm.room.roomId = :roomId AND cm.deletedAt IS NULL AND cm.account.accountId <> :excludeAccountId"
    )
    int incrementUnreadCountForRecipients(
            @Param("roomId") Long roomId,
            @Param("excludeAccountId") Long excludeAccountId,
            @Param("delta") long delta
    );

    @Modifying
    @Transactional
    @Query(
            "UPDATE ChatMember cm " +
            "SET cm.unreadCount = 0 " +
            "WHERE cm.room.roomId = :roomId AND cm.account.accountId = :accountId AND cm.deletedAt IS NULL"
    )
    int resetUnreadCount(
            @Param("roomId") Long roomId,
            @Param("accountId") Long accountId
    );
}




