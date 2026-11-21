package com.louage.board;

import com.louage.queue.QueueEntry;
import com.louage.queue.QueueRepository;
import com.louage.queue.QueueStatus;
import com.louage.station.Route;
import com.louage.station.RouteFare;
import com.louage.station.RouteFareRepository;
import com.louage.station.RouteRepository;
import com.louage.station.Station;
import com.louage.station.StationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
@Transactional(readOnly = true)
public class BoardService {

    private final StationRepository stationRepository;
    private final RouteRepository routeRepository;
    private final RouteFareRepository routeFareRepository;
    private final QueueRepository queueRepository;

    public BoardService(StationRepository stationRepository,
                        RouteRepository routeRepository,
                        RouteFareRepository routeFareRepository,
                        QueueRepository queueRepository) {
        this.stationRepository = stationRepository;
        this.routeRepository = routeRepository;
        this.routeFareRepository = routeFareRepository;
        this.queueRepository = queueRepository;
    }

    public Optional<BoardSnapshot> getBoardSnapshot(Long stationId) {
        return stationRepository.findById(stationId).map(this::buildSnapshot);
    }

    public BoardSnapshot buildSnapshot(Station station) {
        List<Route> routes = routeRepository.findByStationIdAndActiveTrue(station.getId());
        List<QueueEntry> activeEntries = queueRepository.findByStationIdAndStatuses(
                station.getId(),
                List.of(QueueStatus.BOARDING, QueueStatus.QUEUED, QueueStatus.FULL)
        );

        // Preload fares
        Map<Long, Double> fareMap = new HashMap<>();
        for (Route r : routes) {
            fareMap.put(r.getId(), routeFareRepository.findLatestFareByRouteId(r.getId())
                    .map(RouteFare::getFareTnd).orElse(10.0));
        }

        // Build destination summaries
        List<BoardSnapshot.DestinationSummary> destinations = new ArrayList<>();
        Map<Long, Integer> routeCounts = new HashMap<>();
        for (QueueEntry e : activeEntries) {
            routeCounts.merge(e.getRoute().getId(), 1, Integer::sum);
        }

        for (Route r : routes) {
            destinations.add(new BoardSnapshot.DestinationSummary(
                    r.getId(),
                    r.getDestinationNameFr(),
                    r.getDestinationNameAr(),
                    fareMap.getOrDefault(r.getId(), 0.0),
                    r.getEstimatedDurationMin(),
                    r.getDistanceKm(),
                    routeCounts.getOrDefault(r.getId(), 0)
            ));
        }

        // Map entries into vehicle DTOs with calculated ETA and position
        Map<Long, Integer> routePosTracker = new HashMap<>();
        List<BoardSnapshot.BoardVehicleDto> vehicleDtos = new ArrayList<>();

        for (QueueEntry entry : activeEntries) {
            Long rId = entry.getRoute().getId();
            int currentPos = routePosTracker.getOrDefault(rId, 0) + 1;
            routePosTracker.put(rId, currentPos);

            int capacity = entry.getCapacity();
            int taken = entry.getSeatsTaken();
            int remaining = Math.max(0, capacity - taken);

            String etaRange = calculateEtaRange(entry.getStatus(), currentPos, remaining);

            vehicleDtos.add(new BoardSnapshot.BoardVehicleDto(
                    entry.getId(),
                    rId,
                    entry.getRoute().getDestinationNameFr(),
                    entry.getRoute().getDestinationNameAr(),
                    entry.getVehicle().getPlate(),
                    entry.getVehicle().getDriverName(),
                    entry.getStatus().name(),
                    capacity,
                    taken,
                    remaining,
                    entry.getSortKey(),
                    currentPos,
                    etaRange,
                    entry.getJoinedAt(),
                    entry.getBoardingStartedAt(),
                    fareMap.getOrDefault(rId, 0.0)
            ));
        }

        return new BoardSnapshot(
                station.getId(),
                station.getNameFr(),
                station.getNameAr(),
                station.getGovernorate(),
                station.getNameAr(),
                station.getAddress(),
                station.getPhone(),
                station.getOperatingHours(),
                Instant.now(),
                destinations,
                vehicleDtos
        );
    }

    private String calculateEtaRange(QueueStatus status, int position, int seatsRemaining) {
        if (status == QueueStatus.FULL) {
            return "Imminent (Complet)";
        }
        if (status == QueueStatus.BOARDING) {
            if (seatsRemaining == 0) return "Imminent (Complet)";
            if (seatsRemaining <= 2) return "≈ 5–10 min";
            if (seatsRemaining <= 4) return "≈ 10–18 min";
            return "≈ 15–25 min";
        }
        // QUEUED
        int minEst = position * 15;
        int maxEst = position * 25;
        return "≈ " + minEst + "–" + maxEst + " min";
    }
}
