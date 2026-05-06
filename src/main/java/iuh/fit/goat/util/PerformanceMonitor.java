package iuh.fit.goat.util;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class PerformanceMonitor {
    private final long startTime;
    private long lastCheckpoint;
    private final String operation;

    public PerformanceMonitor(String operation) {
        this.operation = operation;
        this.startTime = System.currentTimeMillis();
        this.lastCheckpoint = this.startTime;
    }

    public void checkpoint(String step) {
        long currentTime = System.currentTimeMillis();
        long deltaMs = currentTime - lastCheckpoint;
        long totalMs = currentTime - startTime;
        
        log.info("⏱️ [{}] {} | +{}ms (total: {}ms)", operation, step, deltaMs, totalMs);
        
        this.lastCheckpoint = currentTime;
    }

    public long end() {
        long elapsed = System.currentTimeMillis() - startTime;
        log.info("✅ [{}] COMPLETED - {}ms total", operation, elapsed);
        return elapsed;
    }

    public static long measure(String name, Runnable action) {
        long start = System.currentTimeMillis();
        try {
            action.run();
            long elapsed = System.currentTimeMillis() - start;
            log.info("⏱️ {} completed in {}ms", name, elapsed);
            return elapsed;
        } catch (Exception e) {
            long elapsed = System.currentTimeMillis() - start;
            log.error("❌ {} failed after {}ms", name, elapsed, e);
            throw new RuntimeException(e);
        }
    }
}
