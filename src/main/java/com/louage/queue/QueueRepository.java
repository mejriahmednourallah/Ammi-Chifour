package com.louage.queue;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface QueueRepository extends JpaRepository<QueueEntry, Long> {

    @Query("SELECT q FROM QueueEntry q WHERE q.route.station.id = :stationId AND q.status IN :statuses ORDER BY q.sortKey ASC")
    List<QueueEntry> findByStationIdAndStatuses(@Param("stationId") Long stationId, @Param("statuses") Collection<QueueStatus> statuses);

    @Query("SELECT q FROM QueueEntry q WHERE q.route.id = :routeId AND q.status IN :statuses ORDER BY q.sortKey ASC")
    List<QueueEntry> findByRouteIdAndStatuses(@Param("routeId") Long routeId, @Param("statuses") Collection<QueueStatus> statuses);

    Optional<QueueEntry> findFirstByRouteIdAndStatus(Long routeId, QueueStatus status);

    Optional<QueueEntry> findFirstByRouteIdAndStatusOrderBySortKeyAsc(Long routeId, QueueStatus status);

    @Query("SELECT q FROM QueueEntry q WHERE q.vehicle.id = :vehicleId AND q.status IN ('QUEUED', 'BOARDING', 'FULL')")
    Optional<QueueEntry> findActiveEntryByVehicleId(@Param("vehicleId") Long vehicleId);

    @Modifying
    @Query(value = "UPDATE queue_entries SET " +
            "seats_taken = seats_taken + :delta, " +
            "version = version + 1, " +
            "status = CASE WHEN seats_taken + :delta = capacity THEN 'FULL' ELSE status END, " +
            "full_at = CASE WHEN seats_taken + :delta = capacity THEN CURRENT_TIMESTAMP ELSE full_at END " +
            "WHERE id = :id AND status = 'BOARDING' AND seats_taken + :delta BETWEEN 0 AND capacity",
            nativeQuery = true)
    int guardedUpdateSeats(@Param("id") Long id, @Param("delta") int delta);

    @Modifying
    @Query(value = "UPDATE queue_entries SET " +
            "seats_taken = :seatsTaken, " +
            "version = version + 1, " +
            "status = CASE WHEN :seatsTaken = capacity THEN 'FULL' ELSE status END, " +
            "full_at = CASE WHEN :seatsTaken = capacity THEN CURRENT_TIMESTAMP ELSE full_at END " +
            "WHERE id = :id AND status = 'BOARDING' AND version = :expectedVersion AND :seatsTaken BETWEEN 0 AND capacity",
            nativeQuery = true)
    int updateSeatsCorrection(@Param("id") Long id, @Param("seatsTaken") int seatsTaken, @Param("expectedVersion") int expectedVersion);
}
