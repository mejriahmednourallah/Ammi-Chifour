package com.louage.queue;

import com.louage.fleet.FleetService;
import com.louage.fleet.Vehicle;
import com.louage.station.Route;
import com.louage.station.RouteRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class QueueService {

    private final QueueRepository queueRepository;
    private final SeatEventRepository seatEventRepository;
    private final RouteRepository routeRepository;
    private final FleetService fleetService;
    private final ApplicationEventPublisher eventPublisher;

    public QueueService(QueueRepository queueRepository,
                        SeatEventRepository seatEventRepository,
                        RouteRepository routeRepository,
                        FleetService fleetService,
                        ApplicationEventPublisher eventPublisher) {
        this.queueRepository = queueRepository;
        this.seatEventRepository = seatEventRepository;
        this.routeRepository = routeRepository;
        this.fleetService = fleetService;
        this.eventPublisher = eventPublisher;
    }

    public QueueEntry joinQueue(Long routeId, String plate, String driverName, Short capacity) {
        Route route = routeRepository.findById(routeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Route not found"));

        Vehicle vehicle = fleetService.getOrCreateVehicle(plate, driverName, capacity != null ? capacity : 8);

        Optional<QueueEntry> existing = queueRepository.findActiveEntryByVehicleId(vehicle.getId());
        if (existing.isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Vehicle already has an active queue entry");
        }

        long sortKey = System.currentTimeMillis() * 1000L + (System.nanoTime() % 1000L);

        // Check if route has an active BOARDING vehicle
        boolean hasBoarding = queueRepository.findFirstByRouteIdAndStatus(routeId, QueueStatus.BOARDING).isPresent();

        QueueEntry entry = new QueueEntry();
        entry.setRoute(route);
        entry.setVehicle(vehicle);
        entry.setCapacity(vehicle.getCapacity());
        entry.setSeatsTaken((short) 0);
        entry.setSortKey(sortKey);
        entry.setJoinedAt(Instant.now());

        if (!hasBoarding) {
            entry.setStatus(QueueStatus.BOARDING);
            entry.setBoardingStartedAt(Instant.now());
        } else {
            entry.setStatus(QueueStatus.QUEUED);
        }

        QueueEntry saved = queueRepository.save(entry);
        eventPublisher.publishEvent(new StationBoardChangedEvent(route.getStation().getId(), routeId, "JOIN"));
        return saved;
    }

    public QueueEntry updateSeats(Long queueEntryId, int delta, UUID eventId, Instant clientTs, Long actorId) {
        QueueEntry entry = queueRepository.findById(queueEntryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Queue entry not found"));

        // Idempotency: if event already processed, return current entry without error
        if (eventId != null && seatEventRepository.existsById(eventId)) {
            return entry;
        }

        // Record seat event
        if (eventId != null) {
            seatEventRepository.save(new SeatEvent(
                    eventId,
                    queueEntryId,
                    (short) delta,
                    clientTs != null ? clientTs : Instant.now(),
                    Instant.now(),
                    actorId
            ));
        }

        // Guarded atomic update
        int updated = queueRepository.guardedUpdateSeats(queueEntryId, delta);
        if (updated == 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Seat update rejected: vehicle full, departed, or capacity bound breached");
        }

        // Reload entry after update
        QueueEntry reloaded = queueRepository.findById(queueEntryId).orElseThrow();

        // If newly FULL, automatically promote next QUEUED vehicle on this route
        if (reloaded.getStatus() == QueueStatus.FULL) {
            promoteNextQueued(reloaded.getRoute().getId());
        }

        eventPublisher.publishEvent(new StationBoardChangedEvent(
                reloaded.getRoute().getStation().getId(),
                reloaded.getRoute().getId(),
                "SEAT_UPDATE"
        ));

        return reloaded;
    }

    public QueueEntry setSeatsCorrection(Long queueEntryId, int exactValue, int expectedVersion, Long actorId) {
        int updated = queueRepository.updateSeatsCorrection(queueEntryId, exactValue, expectedVersion);
        if (updated == 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Correction conflict: state changed concurrently");
        }

        QueueEntry reloaded = queueRepository.findById(queueEntryId).orElseThrow();
        if (reloaded.getStatus() == QueueStatus.FULL) {
            promoteNextQueued(reloaded.getRoute().getId());
        }

        eventPublisher.publishEvent(new StationBoardChangedEvent(
                reloaded.getRoute().getStation().getId(),
                reloaded.getRoute().getId(),
                "SEAT_CORRECTION"
        ));
        return reloaded;
    }

    public QueueEntry departVehicle(Long queueEntryId, String reason) {
        QueueEntry entry = queueRepository.findById(queueEntryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Queue entry not found"));

        entry.setStatus(QueueStatus.DEPARTED);
        entry.setDepartedAt(Instant.now());
        QueueEntry saved = queueRepository.save(entry);

        // Ensure next vehicle is promoted to BOARDING
        promoteNextQueued(entry.getRoute().getId());

        eventPublisher.publishEvent(new StationBoardChangedEvent(
                entry.getRoute().getStation().getId(),
                entry.getRoute().getId(),
                "DEPARTED"
        ));
        return saved;
    }

    public QueueEntry cancelQueueEntry(Long queueEntryId, String reason) {
        QueueEntry entry = queueRepository.findById(queueEntryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Queue entry not found"));

        boolean wasBoarding = entry.getStatus() == QueueStatus.BOARDING;
        entry.setStatus(QueueStatus.CANCELLED);
        QueueEntry saved = queueRepository.save(entry);

        if (wasBoarding) {
            promoteNextQueued(entry.getRoute().getId());
        }

        eventPublisher.publishEvent(new StationBoardChangedEvent(
                entry.getRoute().getStation().getId(),
                entry.getRoute().getId(),
                "CANCELLED"
        ));
        return saved;
    }

    public QueueEntry moveQueueEntry(Long queueEntryId, Long previousEntryId, Long nextEntryId) {
        QueueEntry entry = queueRepository.findById(queueEntryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Queue entry not found"));

        long newSortKey;
        if (previousEntryId != null && nextEntryId != null) {
            QueueEntry prev = queueRepository.findById(previousEntryId).orElseThrow();
            QueueEntry next = queueRepository.findById(nextEntryId).orElseThrow();
            newSortKey = (prev.getSortKey() + next.getSortKey()) / 2;
        } else if (previousEntryId != null) {
            QueueEntry prev = queueRepository.findById(previousEntryId).orElseThrow();
            newSortKey = prev.getSortKey() + 100_000L;
        } else if (nextEntryId != null) {
            QueueEntry next = queueRepository.findById(nextEntryId).orElseThrow();
            newSortKey = Math.max(1L, next.getSortKey() - 100_000L);
        } else {
            newSortKey = System.currentTimeMillis() * 1000L;
        }

        entry.setSortKey(newSortKey);
        QueueEntry saved = queueRepository.save(entry);

        eventPublisher.publishEvent(new StationBoardChangedEvent(
                entry.getRoute().getStation().getId(),
                entry.getRoute().getId(),
                "MOVED"
        ));
        return saved;
    }

    private void promoteNextQueued(Long routeId) {
        boolean hasBoarding = queueRepository.findFirstByRouteIdAndStatus(routeId, QueueStatus.BOARDING).isPresent();
        if (!hasBoarding) {
            queueRepository.findFirstByRouteIdAndStatusOrderBySortKeyAsc(routeId, QueueStatus.QUEUED)
                    .ifPresent(next -> {
                        next.setStatus(QueueStatus.BOARDING);
                        next.setBoardingStartedAt(Instant.now());
                        queueRepository.save(next);
                    });
        }
    }

    public List<QueueEntry> getActiveEntriesForStation(Long stationId) {
        return queueRepository.findByStationIdAndStatuses(stationId, List.of(QueueStatus.BOARDING, QueueStatus.QUEUED, QueueStatus.FULL));
    }
}
