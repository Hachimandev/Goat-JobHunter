package iuh.fit.goat.service.cache;

import iuh.fit.goat.entity.ChatRoom;
import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class ChatRoomCacheService {
    private final Cache<Long, ChatRoom> chatRoomCache;

    public ChatRoomCacheService() {
        this.chatRoomCache = CacheBuilder.newBuilder()
                .expireAfterWrite(5, TimeUnit.MINUTES)
                .maximumSize(5000)
                .build();
    }

    public ChatRoom getCached(Long roomId) {
        if (roomId == null) return null;
        ChatRoom cached = this.chatRoomCache.getIfPresent(roomId);
        if (cached != null) {
            log.debug("✅ ChatRoom cache HIT for roomId={}", roomId);
        }
        return cached;
    }

    public void cache(ChatRoom chatRoom) {
        if (chatRoom == null || chatRoom.getRoomId() == null) return;
        this.chatRoomCache.put(chatRoom.getRoomId(), chatRoom);
        log.debug("💾 ChatRoom cached: roomId={}", chatRoom.getRoomId());
    }
}
