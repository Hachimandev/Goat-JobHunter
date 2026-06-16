package iuh.fit.goat.service.impl;

import iuh.fit.goat.dto.response.message.MessageReactionResponse;
import iuh.fit.goat.dto.response.message.ReactionGroupResponse;
import iuh.fit.goat.dto.response.message.ReactionUpdateEvent;
import iuh.fit.goat.dto.response.message.UserReactionInfo;
import iuh.fit.goat.entity.Account;
import iuh.fit.goat.entity.ChatRoom;
import iuh.fit.goat.entity.Company;
import iuh.fit.goat.entity.Message;
import iuh.fit.goat.entity.User;
import iuh.fit.goat.entity.UserReaction;
import iuh.fit.goat.exception.InvalidException;
import iuh.fit.goat.repository.MessageRepository;
import iuh.fit.goat.service.MessageReactionService;
import iuh.fit.goat.service.helper.ChatRoomPermissionGuard;
import iuh.fit.goat.service.helper.MessageHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.regex.Pattern;

@Service
@Slf4j
@RequiredArgsConstructor
public class MessageReactionServiceImpl implements MessageReactionService {

    private static final Pattern EMOJI_PATTERN = Pattern.compile("^[\\p{So}\\p{Cf}]+$");

    private final MessageRepository messageRepository;
    private final MessageHelper messageHelper;
    private final ChatRoomPermissionGuard permissionGuard;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public MessageReactionResponse addReaction(Long chatRoomId, String messageId, Account currentAccount, String emoji) throws InvalidException {
        if (!isValidEmoji(emoji)) {
            throw new InvalidException("Invalid emoji character");
        }

        ChatRoom chatRoom = messageHelper.getChatRoom(chatRoomId);
        permissionGuard.getCurrentMember(chatRoom, currentAccount.getAccountId());

        Message message = messageRepository.findByChatRoomIdAndMessageId(chatRoomId.toString(), messageId)
                .orElseThrow(() -> new InvalidException("Message does not exist"));
        if (Boolean.TRUE.equals(message.getIsHidden())) {
            throw new InvalidException("Message has been recalled");
        }

        Map<String, List<UserReaction>> reactions = message.getReactions();
        if (reactions == null) {
            reactions = new HashMap<>();
            message.setReactions(reactions);
        }

        Long accountId = currentAccount.getAccountId();
        String fullName = currentAccount instanceof Company company ? company.getName() : ((User) Objects.requireNonNull(currentAccount)).getFullName();
        UserReaction newReaction = buildUserReactionEntity(accountId, fullName, currentAccount.getUsername(), currentAccount.getAvatar());

        String previousEmoji = null;

        for (Map.Entry<String, List<UserReaction>> entry : reactions.entrySet()) {
            List<UserReaction> users = entry.getValue();
            for (int i = 0; i < users.size(); i++) {
                if (users.get(i).getAccountId().equals(accountId)) {
                    if (entry.getKey().equals(emoji)) {
                        users.remove(i);
                        if (users.isEmpty()) {
                            reactions.remove(entry.getKey());
                        }
                        saveMessage(message);
                        MessageReactionResponse response = buildResponse(messageId, reactions);
                        broadcastReaction(messageId, null, emoji, "REMOVED", toUserReactionInfo(newReaction), 0, chatRoomId);
                        return response;
                    } else {
                        previousEmoji = entry.getKey();
                        users.remove(i);
                        if (users.isEmpty()) {
                            reactions.remove(previousEmoji);
                        }
                        break;
                    }
                }
            }
            if (previousEmoji != null) {
                break;
            }
        }

        reactions.computeIfAbsent(emoji, k -> new ArrayList<>()).add(newReaction);
        saveMessage(message);
        MessageReactionResponse response = buildResponse(messageId, reactions);
        int totalCount = reactions.getOrDefault(emoji, Collections.emptyList()).size();
        String action = previousEmoji != null ? "REPLACED" : "ADDED";
        broadcastReaction(messageId, previousEmoji, emoji, action, toUserReactionInfo(newReaction), totalCount, chatRoomId);
        return response;
    }

    @Override
    public MessageReactionResponse removeReaction(Long chatRoomId, String messageId, Account currentAccount, String emoji) throws InvalidException {
        if (!isValidEmoji(emoji)) {
            throw new InvalidException("Invalid emoji character");
        }

        ChatRoom chatRoom = messageHelper.getChatRoom(chatRoomId);
        permissionGuard.getCurrentMember(chatRoom, currentAccount.getAccountId());

        Message message = messageRepository.findByChatRoomIdAndMessageId(chatRoomId.toString(), messageId)
                .orElseThrow(() -> new InvalidException("Message does not exist"));
        if (Boolean.TRUE.equals(message.getIsHidden())) {
            throw new InvalidException("Message has been recalled");
        }

        Map<String, List<UserReaction>> reactions = message.getReactions();
        if (reactions == null || !reactions.containsKey(emoji)) {
            return buildResponse(messageId, reactions != null ? reactions : Collections.emptyMap());
        }

        Long accountId = currentAccount.getAccountId();
        List<UserReaction> users = reactions.get(emoji);
        UserReaction removedReaction = null;

        for (int i = 0; i < users.size(); i++) {
            if (users.get(i).getAccountId().equals(accountId)) {
                removedReaction = users.remove(i);
                break;
            }
        }

        if (removedReaction == null) {
            return buildResponse(messageId, reactions);
        }

        if (users.isEmpty()) {
            reactions.remove(emoji);
        }

        saveMessage(message);
        MessageReactionResponse response = buildResponse(messageId, reactions);
        int totalCount = reactions.getOrDefault(emoji, Collections.emptyList()).size();
        broadcastReaction(messageId, null, emoji, "REMOVED", toUserReactionInfo(removedReaction), totalCount, chatRoomId);
        return response;
    }

    @Override
    public MessageReactionResponse getReactions(Long chatRoomId, String messageId, Account currentAccount) throws InvalidException {
        ChatRoom chatRoom = messageHelper.getChatRoom(chatRoomId);
        permissionGuard.getCurrentMember(chatRoom, currentAccount.getAccountId());

        Message message = messageRepository.findByChatRoomIdAndMessageId(chatRoomId.toString(), messageId)
                .orElseThrow(() -> new InvalidException("Message does not exist"));

        Map<String, List<UserReaction>> reactions = message.getReactions();
        return buildResponse(messageId, reactions != null ? reactions : Collections.emptyMap());
    }

    private boolean isValidEmoji(String emoji) {
        return emoji != null && !emoji.isBlank() && EMOJI_PATTERN.matcher(emoji).matches();
    }

    private UserReaction buildUserReactionEntity(Long accountId, String fullName, String username, String avatar) {
        UserReaction reaction = new UserReaction();
        reaction.setAccountId(accountId);
        reaction.setFullName(fullName);
        reaction.setUsername(username);
        reaction.setAvatar(avatar);
        reaction.setReactedAt(Instant.now());
        return reaction;
    }

    private UserReactionInfo toUserReactionInfo(UserReaction reaction) {
        return UserReactionInfo.builder()
                .accountId(reaction.getAccountId())
                .fullName(reaction.getFullName())
                .username(reaction.getUsername())
                .avatar(reaction.getAvatar())
                .reactedAt(reaction.getReactedAt())
                .build();
    }

    private MessageReactionResponse buildResponse(String messageId, Map<String, List<UserReaction>> reactions) {
        List<ReactionGroupResponse> groups = new ArrayList<>();

        for (Map.Entry<String, List<UserReaction>> entry : reactions.entrySet()) {
            List<UserReaction> users = entry.getValue();
            if (users == null || users.isEmpty()) {
                continue;
            }

            List<UserReactionInfo> userInfos = users.stream()
                    .map(this::toUserReactionInfo)
                    .toList();

            ReactionGroupResponse group = new ReactionGroupResponse();
            group.setEmoji(entry.getKey());
            group.setCount(users.size());
            group.setUsers(userInfos);
            groups.add(group);
        }

        groups.sort((a, b) -> Integer.compare(b.getCount(), a.getCount()));

        MessageReactionResponse response = new MessageReactionResponse();
        response.setMessageId(messageId);
        response.setReactions(groups);
        return response;
    }

    private void broadcastReaction(String messageId, String previousEmoji, String emoji, String action,
                                   UserReactionInfo user, int totalCount, Long chatRoomId) {
        ReactionUpdateEvent event;
        if ("REPLACED".equals(action)) {
            event = ReactionUpdateEvent.replaced(messageId, emoji, previousEmoji, user, totalCount);
        } else if ("REMOVED".equals(action)) {
            event = ReactionUpdateEvent.removed(messageId, emoji, user, totalCount);
        } else {
            event = ReactionUpdateEvent.added(messageId, emoji, user, totalCount);
        }

        messagingTemplate.convertAndSend("/topic/chatrooms/" + chatRoomId + "/reactions", event);
    }

    private void saveMessage(Message message) {
        message.setUpdatedAt(Instant.now());
        messageRepository.saveMessage(message);
        log.info("Saved message with reactions: chatRoomId={}, messageId={}, reactions={}", 
                message.getChatRoomId(), message.getMessageId(), message.getReactions());
    }
}
