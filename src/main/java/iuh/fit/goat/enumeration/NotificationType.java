package iuh.fit.goat.enumeration;

import lombok.Getter;

@Getter
public enum NotificationType {
    LIKE("Thích"), FOLLOW("Theo dõi"),
    COMMENT("Bình luận"), REPLY("Trả lời"), MENTION("Đề cập"), REMINDER("Nhắc hẹn");

    private final String value;

    NotificationType(String value) {
        this.value = value;
    }
}
