package com.louage.queue;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "seat_events")
public class SeatEvent {

    @Id
    @Column(name = "event_id", nullable = false)
    private UUID eventId;

    @Column(name = "queue_entry_id", nullable = false)
    private Long queueEntryId;

    @Column(name = "delta", nullable = false)
    private Short delta;

    @Column(name = "client_ts", nullable = false)
    private Instant clientTs;

    @Column(name = "server_ts", nullable = false)
    private Instant serverTs = Instant.now();

    @Column(name = "actor_id")
    private Long actorId;

    public SeatEvent() {}

    public SeatEvent(UUID eventId, Long queueEntryId, Short delta, Instant clientTs, Instant serverTs, Long actorId) {
        this.eventId = eventId;
        this.queueEntryId = queueEntryId;
        this.delta = delta;
        this.clientTs = clientTs;
        this.serverTs = serverTs != null ? serverTs : Instant.now();
        this.actorId = actorId;
    }

    public UUID getEventId() { return eventId; }
    public void setEventId(UUID eventId) { this.eventId = eventId; }

    public Long getQueueEntryId() { return queueEntryId; }
    public void setQueueEntryId(Long queueEntryId) { this.queueEntryId = queueEntryId; }

    public Short getDelta() { return delta; }
    public void setDelta(Short delta) { this.delta = delta; }

    public Instant getClientTs() { return clientTs; }
    public void setClientTs(Instant clientTs) { this.clientTs = clientTs; }

    public Instant getServerTs() { return serverTs; }
    public void setServerTs(Instant serverTs) { this.serverTs = serverTs; }

    public Long getActorId() { return actorId; }
    public void setActorId(Long actorId) { this.actorId = actorId; }
}
