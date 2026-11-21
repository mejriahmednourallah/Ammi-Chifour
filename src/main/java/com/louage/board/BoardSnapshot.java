package com.louage.board;

import java.time.Instant;
import java.util.List;

public record BoardSnapshot(
        Long stationId,
        String stationNameFr,
        String stationNameAr,
        String cityFr,
        String cityAr,
        String address,
        String phone,
        String operatingHours,
        Instant generatedAt,
        List<DestinationSummary> destinations,
        List<BoardVehicleDto> vehicles
) {
    public record DestinationSummary(
            Long routeId,
            String destinationFr,
            String destinationAr,
            Double fareTnd,
            Integer estimatedDurationMin,
            Integer distanceKm,
            Integer waitingCount
    ) {}

    public record BoardVehicleDto(
            Long queueEntryId,
            Long routeId,
            String destinationFr,
            String destinationAr,
            String plate,
            String driverName,
            String status,
            int capacity,
            int seatsTaken,
            int seatsRemaining,
            long sortKey,
            int queuePosition,
            String etaRange,
            Instant joinedAt,
            Instant boardingStartedAt,
            Double fareTnd
    ) {}
}
