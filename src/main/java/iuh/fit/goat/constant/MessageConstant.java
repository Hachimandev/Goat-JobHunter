package iuh.fit.goat.constant;

public final class MessageConstant {

    public static final String UNAVAILABLE_MESSAGE_PREVIEW = "Tin nhắn không khả dụng";
    public static final String REVOKED_MESSAGE_PREVIEW = "Tin nhắn đã được thu hồi";
    public static final String MESSAGE_DELETED_EVENT = "MESSAGE_DELETED";
    public static final String DELETE_TYPE_ORIGINAL = "original";
    public static final String DELETE_TYPE_FORWARDED = "forwarded";

    public static final int MAX_REPLY_PREVIEW_LENGTH = 120;
    public static final int maxCursorPageSize = 50;
    public static final int DEFAULT_SEARCH_PAGE_SIZE = 20;
    public static final int DEFAULT_CURSOR_BATCH_QUERY_SIZE = 40;
    public static final int MAX_CURSOR_BATCH_QUERY_SIZE = 100;
    public static final int cursorBatchQuerySize = 40;
    public static final int DEFAULT_REPLY_LOOKUP_SCAN_LIMIT = 400;
    public static final int MAX_FORWARD_TARGETS = 20;
    public static final int MAX_SEARCH_PAGE_SIZE = 50;
    public static final long MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
    public static final int MAX_MEDIA_ITEMS_PER_MESSAGE = 10;
    public static final long MAX_MEDIA_BATCH_SIZE = 100 * 1024 * 1024; // 100MB
    public static final int MAX_SEARCH_TERM_LENGTH = 100;
    public static final int SEARCH_SCAN_LIMIT = 3000;
    public static final int MAX_SEARCH_TOP_UP_ROUNDS = 2;

}
