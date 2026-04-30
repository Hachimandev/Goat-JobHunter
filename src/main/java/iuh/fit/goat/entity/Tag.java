package iuh.fit.goat.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;

import java.util.ArrayList;
import java.util.List;

import static jakarta.persistence.CascadeType.*;
import static jakarta.persistence.FetchType.LAZY;

@Entity
@Table(
    name = "tags",
    indexes = {
        @Index(name = "idx_tags_owner_account_id", columnList = "owner_account_id"),
        @Index(name = "idx_tags_system_tag", columnList = "system_tag")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_tags_owner_name", columnNames = {"owner_account_id", "name"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FilterDef(name = "activeTagFilter")
@ToString(exclude = {"owner", "chatRoomTagAssignments"})
public class Tag extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long tagId;
    private String name;
    private String color;
    private boolean systemTag;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_account_id")
    @JsonIgnore
    private Account owner;

    @OneToMany(mappedBy = "tag", fetch = LAZY, cascade = {PERSIST, MERGE, REMOVE})
    @JsonIgnore
    @Filter(
            name = "activeChatRoomTagAssignmentFilter",
            condition = "deleted_at IS NULL"
    )
    private List<ChatRoomTagAssignment> chatRoomTagAssignments = new ArrayList<>();
}
