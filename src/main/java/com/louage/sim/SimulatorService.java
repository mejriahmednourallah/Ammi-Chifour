package com.louage.sim;

import com.louage.queue.QueueEntry;
import com.louage.queue.QueueRepository;
import com.louage.queue.QueueService;
import com.louage.queue.QueueStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;

@Service
public class SimulatorService {

    private static final Logger log = LoggerFactory.getLogger(SimulatorService.class);

    private final QueueService queueService;
    private final QueueRepository queueRepository;

    private final AtomicBoolean isRunning = new AtomicBoolean(true);
    private final AtomicReference<Double> speedMultiplier = new AtomicReference<>(1.0);
    private final Random random = new Random(42); // Seeded RNG for reproducible demo

    public SimulatorService(QueueService queueService, QueueRepository queueRepository) {
        this.queueService = queueService;
        this.queueRepository = queueRepository;
    }

    public void start() {
        isRunning.set(true);
        log.info("Louage Simulator started");
    }

    public void stop() {
        isRunning.set(false);
        log.info("Louage Simulator stopped");
    }

    public void setSpeed(double speed) {
        speedMultiplier.set(Math.max(0.1, Math.min(20.0, speed)));
        log.info("Louage Simulator speed set to {}", speed);
    }

    public boolean isRunning() {
        return isRunning.get();
    }

    public double getSpeed() {
        return speedMultiplier.get();
    }

    // Tick executed periodically
    @Scheduled(fixedRate = 4000)
    public void simulationTick() {
        if (!isRunning.get()) return;

        try {
            double chance = 0.40 * speedMultiplier.get();

            // Find all BOARDING entries in the system
            List<QueueEntry> boarding = queueRepository.findAll().stream()
                    .filter(e -> e.getStatus() == QueueStatus.BOARDING && e.getSeatsTaken() < e.getCapacity())
                    .toList();

            for (QueueEntry entry : boarding) {
                if (random.nextDouble() < chance) {
                    // Simulate a rider arriving and boarding this vehicle
                    queueService.updateSeats(
                            entry.getId(),
                            1,
                            UUID.randomUUID(),
                            Instant.now(),
                            null
                    );
                }
            }

            // Find FULL vehicles and simulate dwell time departure
            List<QueueEntry> fullEntries = queueRepository.findAll().stream()
                    .filter(e -> e.getStatus() == QueueStatus.FULL)
                    .toList();

            for (QueueEntry full : fullEntries) {
                if (random.nextDouble() < (0.35 * speedMultiplier.get())) {
                    queueService.departVehicle(full.getId(), "SIM_FULL_DEPARTURE");
                }
            }
        } catch (Exception e) {
            log.debug("Simulation tick exception (handled): {}", e.getMessage());
        }
    }
}
