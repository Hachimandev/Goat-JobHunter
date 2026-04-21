package iuh.fit.goat.repository;

import iuh.fit.goat.entity.Poll;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Expression;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.model.PageIterable;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryEnhancedRequest;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;

import java.util.List;
import java.util.Optional;

@Repository
@Slf4j
@RequiredArgsConstructor
public class PollRepository {
    private final DynamoDbTable<Poll> pollTable;

    public Poll save(Poll poll) {
        try {
            this.pollTable.putItem(poll);
            return poll;
        } catch (Exception e) {
            log.error("Error saving poll: {}", poll.getPollId(), e);
            throw new RuntimeException("Failed to save poll", e);
        }
    }

    public Optional<Poll> findByPollId(Long chatRoomId, String pollId) {
        if (pollId == null || pollId.isBlank() || chatRoomId == null) {
            return Optional.empty();
        }
        try {
            QueryConditional queryConditional = QueryConditional.keyEqualTo(
                    Key.builder().partitionValue(pollId).build()
            );

            Expression filterExpression = Expression.builder()
                    .expression("chatRoomId = :chatRoomId")
                    .putExpressionValue(
                            ":chatRoomId",
                            AttributeValue.builder().n(String.valueOf(chatRoomId)).build()
                    )
                    .build();

            QueryEnhancedRequest request = QueryEnhancedRequest.builder()
                    .queryConditional(queryConditional)
                    .filterExpression(filterExpression)
                    .build();

            PageIterable<Poll> pages = pollTable.query(request);

            return pages.stream()
                    .flatMap(page -> page.items().stream())
                    .findFirst();
        } catch (Exception e) {
            log.error("Error finding poll by ID: {}", pollId, e);
            throw new RuntimeException("Failed to find poll", e);
        }
    }

    public List<Poll> findByChatRoomId(String chatRoomId) {
        if (chatRoomId == null || chatRoomId.isBlank()) return List.of();
        try {
            return this.pollTable.query(
                    QueryConditional.keyEqualTo(Key.builder().partitionValue(chatRoomId).build())
            ).items().stream().toList();
        } catch (Exception e) {
            log.error("Error finding polls by chat room: {}", chatRoomId, e);
            throw new RuntimeException("Failed to find polls", e);
        }
    }

    public void delete(String pollId) {
        if (pollId == null || pollId.isBlank()) return;
        try {
            Key key = Key.builder().partitionValue(pollId).build();
            this.pollTable.deleteItem(key);
            log.info("Poll deleted: {}", pollId);
        } catch (Exception e) {
            log.error("Error deleting poll: {}", pollId, e);
            throw new RuntimeException("Failed to delete poll", e);
        }
    }
}

