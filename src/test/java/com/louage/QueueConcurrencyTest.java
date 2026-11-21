package com.louage;

import com.louage.queue.QueueEntry;
import com.louage.queue.QueueRepository;
import com.louage.queue.QueueService;
import com.louage.queue.QueueStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class QueueConcurrencyTest {

    @Autowired
    private QueueService queueService;

    @Autowired
    private QueueRepository queueRepository;

    @Test
    @DisplayName("Idempotency: Replaying the same event ID 5 times must be applied exactly once")
    void testIdempotentSeatTaps() {
        // Route 5 has no boarding vehicle initially, so joined vehicle becomes BOARDING
        QueueEntry entry = queueService.joinQueue(5L, "999 تونس 1111", "Test Driver", (short) 8);
        assertEquals(QueueStatus.BOARDING, entry.getStatus(), "First vehicle on route must be in BOARDING status");
        UUID eventId = UUID.randomUUID();

        // 5 consecutive replays of the same event ID
        QueueEntry result1 = queueService.updateSeats(entry.getId(), 1, eventId, Instant.now(), 1L);
        QueueEntry result2 = queueService.updateSeats(entry.getId(), 1, eventId, Instant.now(), 1L);
        QueueEntry result3 = queueService.updateSeats(entry.getId(), 1, eventId, Instant.now(), 1L);
        QueueEntry result4 = queueService.updateSeats(entry.getId(), 1, eventId, Instant.now(), 1L);
        QueueEntry result5 = queueService.updateSeats(entry.getId(), 1, eventId, Instant.now(), 1L);

        assertEquals((short) 1, (short) result5.getSeatsTaken(), "Replayed tap with identical UUID must not increment seats more than once");
    }

    @Test
    @DisplayName("Concurrency: Concurrent taps on vehicle with capacity 8 must never exceed capacity")
    void testConcurrentSeatTapsCappedAtCapacity() throws InterruptedException {
        // Route 6 has no boarding vehicle initially, so joined vehicle becomes BOARDING
        QueueEntry entry = queueService.joinQueue(6L, "888 تونس 2222", "Concurrent Driver", (short) 8);
        assertEquals(QueueStatus.BOARDING, entry.getStatus(), "First vehicle on route must be in BOARDING status");

        int threadCount = 20;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch latch = new CountDownLatch(1);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger conflictCount = new AtomicInteger(0);

        List<Future<?>> futures = new ArrayList<>();
        for (int i = 0; i < threadCount; i++) {
            futures.add(executor.submit(() -> {
                try {
                    latch.await();
                    queueService.updateSeats(entry.getId(), 1, UUID.randomUUID(), Instant.now(), 1L);
                    successCount.incrementAndGet();
                } catch (ResponseStatusException e) {
                    conflictCount.incrementAndGet();
                } catch (Exception e) {
                    // Ignore other exceptions
                }
            }));
        }

        // Release all threads simultaneously
        latch.countDown();
        executor.shutdown();
        assertTrue(executor.awaitTermination(10, TimeUnit.SECONDS));

        QueueEntry finalEntry = queueRepository.findById(entry.getId()).orElseThrow();
        assertEquals((short) 8, (short) finalEntry.getSeatsTaken(), "Total seats taken must be capped strictly at 8");
        assertEquals(8, successCount.get(), "Exactly 8 taps must succeed");
        assertEquals(threadCount - 8, conflictCount.get(), "Remaining taps must be rejected with 409 Conflict");
    }

    @Test
    @DisplayName("Invariant: Route must never have more than one BOARDING vehicle")
    void testOneBoardingVehiclePerRoute() {
        List<QueueEntry> boardingVehicles = queueRepository.findByRouteIdAndStatuses(1L, List.of(QueueStatus.BOARDING));
        assertTrue(boardingVehicles.size() <= 1, "At most one vehicle can be BOARDING per route");
    }
}
