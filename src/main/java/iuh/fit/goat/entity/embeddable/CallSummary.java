package iuh.fit.goat.entity.embeddable;

import iuh.fit.goat.enumeration.ChatCallEndReason;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;

import java.time.Instant;

@DynamoDbBean
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CallSummary {
    private Long sessionId;
    private Instant startedAt;
    private Instant endedAt;
    private Long durationSeconds;
    private ChatCallEndReason endReason;
}
