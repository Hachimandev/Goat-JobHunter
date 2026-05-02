package iuh.fit.goat.service.helper;

import iuh.fit.goat.entity.ChatMember;
import iuh.fit.goat.entity.ChatRoom;
import iuh.fit.goat.enumeration.ChatRole;
import iuh.fit.goat.enumeration.ChatRoomPermissionAction;
import iuh.fit.goat.enumeration.ChatRoomType;
import iuh.fit.goat.exception.InvalidException;
import org.springframework.stereotype.Component;

import java.util.Objects;

@Component
public class ChatRoomPermissionGuard {

    public ChatMember getCurrentMember(ChatRoom chatRoom, Long accountId) throws InvalidException {
        return chatRoom.getMembers().stream()
                .filter(member -> member.getDeletedAt() == null
                        && member.getAccount() != null
                        && Objects.equals(member.getAccount().getAccountId(), accountId))
                .findFirst()
                .orElseThrow(() -> new InvalidException("User is not a member of this chat room"));
    }

    public void assertCanPerformAction(
            ChatRoom chatRoom,
            ChatMember currentMember,
            ChatRoomPermissionAction action
    ) throws InvalidException {
        if (chatRoom == null || currentMember == null || action == null) {
            throw new InvalidException("Invalid permission context");
        }

        if (chatRoom.getType() != ChatRoomType.GROUP) {
            return;
        }

        ChatRole role = currentMember.getRole();
        if (role == ChatRole.OWNER) {
            return;
        }

        if (role == ChatRole.MODERATOR) {
            if (action == ChatRoomPermissionAction.SEND_MESSAGE && !chatRoom.isAllowModeratorSendMessage()) {
                throw new InvalidException("Moderators are not allowed to send messages in this room");
            }
            return;
        }

        if (role != ChatRole.MEMBER) {
            throw new InvalidException("Only owners, moderators, and members can perform this action");
        }

        switch (action) {
            case UPDATE_GROUP_INFO -> {
                if (!chatRoom.isAllowMemberUpdate()) {
                    throw new InvalidException("Members are not allowed to update group info in this room");
                }
            }
            case PIN_CONTENT -> {
                if (!chatRoom.isAllowMemberPin()) {
                    throw new InvalidException("Members are not allowed to manage pinned content in this room");
                }
            }
            case CREATE_POLL -> {
                if (!chatRoom.isAllowMemberCreateVote()) {
                    throw new InvalidException("Members are not allowed to create polls in this room");
                }
            }
            case SEND_MESSAGE -> {
                if (!chatRoom.isAllowMemberSendMessage()) {
                    throw new InvalidException("Members are not allowed to send messages in this room");
                }
            }
            default -> throw new InvalidException("Unsupported permission action");
        }
    }
}
