package iuh.fit.goat.repository;

import iuh.fit.goat.entity.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.util.Optional;

@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {
    Optional<Tag> findByNameIgnoreCaseAndSystemTagIsTrue(String name);

    boolean existsByOwner_AccountIdAndNameIgnoreCaseAndSystemTagIsFalse(Long accountId, String name);

    long countByOwner_AccountIdAndSystemTagIsFalse(Long accountId);

    @Query("""
        SELECT t FROM Tag t
        WHERE t.systemTag = true OR t.owner.accountId = :accountId
        ORDER BY t.systemTag DESC, t.name ASC
        """
    )
    Page<Tag> findVisibleTagsForOwner(@Param("accountId") Long accountId, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM Tag t WHERE t.tagId = :tagId")
    Optional<Tag> findByTagIdForUpdate(@Param("tagId") Long tagId);

    @Query("""
            SELECT t FROM Tag t
            WHERE t.tagId = :tagId
            AND (t.systemTag = true OR t.owner.accountId = :accountId)
            """)
    Optional<Tag> findAccessibleTag(@Param("tagId") Long tagId, @Param("accountId") Long accountId);
}

