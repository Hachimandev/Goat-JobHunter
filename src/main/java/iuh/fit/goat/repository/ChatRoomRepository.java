package iuh.fit.goat.repository;

import iuh.fit.goat.entity.ChatRoom;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

//    Optional<ChatRoom> findByRoomId(Long chatRoomId);

        boolean existsByRoomIdAndDeletedAtIsNull(Long chatRoomId);

    Optional<ChatRoom> findByRoomIdAndDeletedAtIsNull(Long chatRoomId);

        Page<ChatRoom> findByDeletedAtIsNull(Pageable pageable);

                @Query("""
                                SELECT cr.roomId FROM ChatRoom cr
                                JOIN cr.members cm
                                WHERE cm.account.accountId = :accountId
                                        AND cm.deletedAt IS NULL
                                        AND cr.deletedAt IS NULL
                                ORDER BY COALESCE(cr.lastMessageTime, cr.updatedAt, cr.createdAt) DESC, cr.roomId DESC
                """)
                Page<Long> findChatRoomIdsByMemberAccountId(
                                                @Param("accountId") Long accountId,
                                                Pageable pageable
                );

                @EntityGraph(attributePaths = {"members", "members.account"})
                @Query("""
                                SELECT DISTINCT cr FROM ChatRoom cr
                                LEFT JOIN cr.members cm
                                WHERE cr.roomId IN :roomIds
                                        AND cr.deletedAt IS NULL
                """)
                List<ChatRoom> findRoomsWithMembersByRoomIds(
                                                @Param("roomIds") List<Long> roomIds
                );

    @Query("""
        SELECT DISTINCT cr FROM ChatRoom cr
        JOIN cr.members cm
        WHERE cm.account.accountId = :accountId
        AND cm.deletedAt IS NULL
        ORDER BY cr.updatedAt DESC
    """)
    Page<ChatRoom> findChatRoomsByMemberAccountId(
            @Param("accountId") Long accountId,
            Pageable pageable
    );

    @Query("""
        SELECT DISTINCT cr FROM ChatRoom cr
        JOIN cr.members cm
        WHERE cm.account.accountId = :accountId
        AND cm.deletedAt IS NULL
        ORDER BY cr.updatedAt DESC
    """)
    List<ChatRoom> findAllChatRoomsByMemberAccountId(@Param("accountId") Long accountId);

        @Modifying
        @Transactional
        @Query("""
                UPDATE ChatRoom cr
                SET cr.lastMessageId = :lastMessageId,
                        cr.lastMessageSenderAccountId = :senderAccountId,
                        cr.lastMessagePreview = :lastMessagePreview,
                        cr.lastMessageTime = :lastMessageTime
                WHERE cr.roomId = :roomId
        """)
        int updateLastMessageSummary(
                        @Param("roomId") Long roomId,
                        @Param("lastMessageId") String lastMessageId,
                        @Param("senderAccountId") Long senderAccountId,
                        @Param("lastMessagePreview") String lastMessagePreview,
                        @Param("lastMessageTime") Instant lastMessageTime
        );

        @Modifying
        @Transactional
        @Query("""
                UPDATE ChatRoom cr
                SET cr.lastMessageId = null,
                        cr.lastMessageSenderAccountId = null,
                        cr.lastMessagePreview = null,
                        cr.lastMessageTime = null
                WHERE cr.roomId = :roomId
        """)
        int clearLastMessageSummary(@Param("roomId") Long roomId);

    @Query("SELECT DISTINCT cr FROM ChatRoom cr " +
            "JOIN cr.members m1 " +
            "JOIN cr.members m2 " +
            "WHERE cr.type = 'DIRECT' " +
            "AND m1.account.accountId = :userId1 " +
            "AND m2.account.accountId = :userId2 " +
            "AND m1.deletedAt IS NULL " +
            "AND m2.deletedAt IS NULL")
    Optional<ChatRoom> findDirectChatRoomBetweenUsers(
            @Param("userId1") Long userId1,
            @Param("userId2") Long userId2
    );

        @Query("""
                SELECT cr FROM ChatRoom cr
                WHERE cr.type = 'DIRECT'
                AND cr.deletedAt IS NULL
                AND EXISTS (
                        SELECT 1 FROM ChatMember cm1
                        WHERE cm1.room = cr
                        AND cm1.account.accountId = :userId1
                        AND cm1.deletedAt IS NULL
                )
                AND EXISTS (
                        SELECT 1 FROM ChatMember cm2
                        WHERE cm2.room = cr
                        AND cm2.account.accountId = :userId2
                        AND cm2.deletedAt IS NULL
                )
                ORDER BY COALESCE(cr.updatedAt, cr.createdAt) DESC, cr.roomId DESC
        """)
        List<ChatRoom> findDirectChatRoomsBetweenUsersOrderByLatest(
                        @Param("userId1") Long userId1,
                        @Param("userId2") Long userId2
        );

    @EntityGraph(attributePaths = {"members", "members.account"})
    Optional<ChatRoom> findByRoomId(Long roomId);
}
