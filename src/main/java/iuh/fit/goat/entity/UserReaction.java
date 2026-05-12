package iuh.fit.goat.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;

import java.time.Instant;

@DynamoDbBean
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserReaction {
    private Long accountId;
    private String fullName;
    private String username;
    private String avatar;
    private Instant reactedAt;

    @DynamoDbAttribute("accountId")
    public Long getAccountId() { return accountId; }

    @DynamoDbAttribute("fullName")
    public String getFullName() { return fullName; }

    @DynamoDbAttribute("username")
    public String getUsername() { return username; }

    @DynamoDbAttribute("avatar")
    public String getAvatar() { return avatar; }

    @DynamoDbAttribute("reactedAt")
    public Instant getReactedAt() { return reactedAt; }
}
