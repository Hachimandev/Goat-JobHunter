package iuh.fit.goat.service.cache;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class BlockedInteractionCacheService {
    private final Cache<String, Boolean> blockedPairCache;

    public BlockedInteractionCacheService() {
        this.blockedPairCache = CacheBuilder.newBuilder()
                .expireAfterWrite(10, TimeUnit.MINUTES)
                .maximumSize(10000)
                .build();
    }

    public Boolean isBlocked(Long lowId, Long highId) {
        String key = this.getCacheKey(lowId, highId);
        return this.blockedPairCache.getIfPresent(key);
    }

    public void putBlocked(Long lowId, Long highId, Boolean isBlocked) {
        String key = this.getCacheKey(lowId, highId);
        this.blockedPairCache.put(key, isBlocked);
    }

    private String getCacheKey(Long lowId, Long highId) {
        return lowId + "|" + highId;
    }
}
