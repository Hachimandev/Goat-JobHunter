package iuh.fit.goat.service;

import iuh.fit.goat.dto.response.message.MessageReactionResponse;
import iuh.fit.goat.entity.Account;
import iuh.fit.goat.exception.InvalidException;

public interface MessageReactionService {
    MessageReactionResponse addReaction(Long chatRoomId, String messageId, Account currentAccount, String emoji) throws InvalidException;
    MessageReactionResponse removeReaction(Long chatRoomId, String messageId, Account currentAccount, String emoji) throws InvalidException;
    MessageReactionResponse getReactions(Long chatRoomId, String messageId, Account currentAccount) throws InvalidException;
}
