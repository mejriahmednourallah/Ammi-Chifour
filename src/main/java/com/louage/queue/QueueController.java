package com.louage.queue;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/queue")
@CrossOrigin(origins = "*")
public class QueueController {

    private final QueueService queueService;

    public QueueController(QueueService queueService) {
        this.queueService = queueService;
    }

    public record JoinQueueRequest(Long routeId, String plate, String driverName, Short capacity) {}
    public record SeatUpdateRequest(UUID eventId, int delta, Instant clientTs) {}
    public record SeatCorrectionRequest(int value, int expectedVersion) {}
    public record MoveQueueRequest(Long previousEntryId, Long nextEntryId) {}
    public record DepartRequest(String reason) {}

    @PostMapping
    public ResponseEntity<QueueEntry> joinQueue(@RequestBody JoinQueueRequest request) {
        QueueEntry entry = queueService.joinQueue(
                request.routeId(),
                request.plate(),
                request.driverName(),
                request.capacity()
        );
        return ResponseEntity.ok(entry);
    }

    @PostMapping("/{id}/seats")
    public ResponseEntity<QueueEntry> updateSeats(@PathVariable("id") Long id,
                                                 @RequestBody SeatUpdateRequest request) {
        UUID eventId = request.eventId() != null ? request.eventId() : UUID.randomUUID();
        QueueEntry entry = queueService.updateSeats(
                id,
                request.delta(),
                eventId,
                request.clientTs(),
                null
        );
        return ResponseEntity.ok(entry);
    }

    @PutMapping("/{id}/seats")
    public ResponseEntity<QueueEntry> correctSeats(@PathVariable("id") Long id,
                                                   @RequestBody SeatCorrectionRequest request) {
        QueueEntry entry = queueService.setSeatsCorrection(
                id,
                request.value(),
                request.expectedVersion(),
                null
        );
        return ResponseEntity.ok(entry);
    }

    @PostMapping("/{id}/depart")
    public ResponseEntity<QueueEntry> depart(@PathVariable("id") Long id,
                                             @RequestBody(required = false) DepartRequest request) {
        String reason = request != null ? request.reason() : "SCHEDULED";
        QueueEntry entry = queueService.departVehicle(id, reason);
        return ResponseEntity.ok(entry);
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<QueueEntry> cancel(@PathVariable("id") Long id,
                                             @RequestBody(required = false) DepartRequest request) {
        String reason = request != null ? request.reason() : "USER_CANCELLED";
        QueueEntry entry = queueService.cancelQueueEntry(id, reason);
        return ResponseEntity.ok(entry);
    }

    @PostMapping("/{id}/move")
    public ResponseEntity<QueueEntry> move(@PathVariable("id") Long id,
                                           @RequestBody MoveQueueRequest request) {
        QueueEntry entry = queueService.moveQueueEntry(id, request.previousEntryId(), request.nextEntryId());
        return ResponseEntity.ok(entry);
    }
}
