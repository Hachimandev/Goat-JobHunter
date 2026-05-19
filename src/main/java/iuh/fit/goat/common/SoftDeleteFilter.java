package iuh.fit.goat.common;

import lombok.Getter;

@Getter
public enum SoftDeleteFilter {
    ACCOUNT("activeAccountFilter"),
    ROLE("activeRoleFilter"),
    PERMISSION("activePermissionFilter"),
    APPLICATION("activeApplicationFilter"),
    RESUME("activeResumeFilter"),
    SKILL("activeSkillFilter"),
    CAREER("activeCareerFilter"),
    SUBSCRIBER("activeSubscriberFilter"),
    INTERVIEW("activeInterviewFilter"),
    FRIEND_REQUEST("activeFriendRequestFilter"),
    USER_RELATIONSHIP("activeUserRelationshipFilter"),
    JOB("activeJobFilter"),
    BLOG("activeBlogFilter"),
    COMMENT("activeCommentFilter"),
    NOTIFICATION("activeNotificationFilter"),
    CHATROOM("activeChatRoomFilter"),
    CHATMEMBER("activeChatMemberFilter"),
    TICKET("activeTicketFilter"),
    REVIEW("activeReviewFilter"),
    RESUMEEVALUATION("activeResumeEvaluationFilter"),
    DEVICE("activeDeviceFilter"),
    TAG("activeTagFilter"),
    CHAT_ROOM_TAG_ASSIGNMENT("activeChatRoomTagAssignmentFilter"),
    REMINDER("activeReminderFilter"),
    REMINDER_PARTICIPANT("activeReminderParticipantFilter");

    private final String value;

    SoftDeleteFilter(String value) {
        this.value = value;
    }
}
