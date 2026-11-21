package com.louage.queue;

import com.louage.fleet.Vehicle;
import com.louage.station.Route;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "queue_entries")
public class QueueEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "route_id", nullable = false)
    private Route route;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private QueueStatus status;

    @Column(name = "sort_key", nullable = false)
    private Long sortKey;

    @Column(name = "capacity", nullable = false)
    private Short capacity = 8;

    @Column(name = "seats_taken", nullable = false)
    private Short seatsTaken = 0;

    @Version
    @Column(name = "version", nullable = false)
    private Integer version = 0;

    @Column(name = "joined_at", nullable = false)
    private Instant joinedAt = Instant.now();

    @Column(name = "boarding_started_at")
    private Instant boardingStartedAt;

    @Column(name = "full_at")
    private Instant fullAt;

    @Column(name = "departed_at")
    private Instant departedAt;

    public QueueEntry() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Route getRoute() { return route; }
    public void setRoute(Route route) { this.route = route; }

    public Vehicle getVehicle() { return vehicle; }
    public void setVehicle(Vehicle vehicle) { this.vehicle = vehicle; }

    public QueueStatus getStatus() { return status; }
    public void setStatus(QueueStatus status) { this.status = status; }

    public Long getSortKey() { return sortKey; }
    public void setSortKey(Long sortKey) { this.sortKey = sortKey; }

    public Short getCapacity() { return capacity; }
    public void setCapacity(Short capacity) { this.capacity = capacity; }

    public Short getSeatsTaken() { return seatsTaken; }
    public void setSeatsTaken(Short seatsTaken) { this.seatsTaken = seatsTaken; }

    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }

    public Instant getJoinedAt() { return joinedAt; }
    public void setJoinedAt(Instant joinedAt) { this.joinedAt = joinedAt; }

    public Instant getBoardingStartedAt() { return boardingStartedAt; }
    public void setBoardingStartedAt(Instant boardingStartedAt) { this.boardingStartedAt = boardingStartedAt; }

    public Instant getFullAt() { return fullAt; }
    public void setFullAt(Instant fullAt) { this.fullAt = fullAt; }

    public Instant getDepartedAt() { return departedAt; }
    public void setDepartedAt(Instant departedAt) { this.departedAt = departedAt; }
}
