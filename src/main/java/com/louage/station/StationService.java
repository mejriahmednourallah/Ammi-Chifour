package com.louage.station;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class StationService {

    private final StationRepository stationRepository;
    private final RouteRepository routeRepository;
    private final RouteFareRepository routeFareRepository;

    public StationService(StationRepository stationRepository,
                          RouteRepository routeRepository,
                          RouteFareRepository routeFareRepository) {
        this.stationRepository = stationRepository;
        this.routeRepository = routeRepository;
        this.routeFareRepository = routeFareRepository;
    }

    public List<Station> getAllStations() {
        return stationRepository.findAll();
    }

    public Optional<Station> getStationById(Long id) {
        return stationRepository.findById(id);
    }

    public List<Station> searchStations(String query) {
        if (query == null || query.isBlank()) {
            return getAllStations();
        }
        return stationRepository.searchByNameOrGovernorate(query.trim());
    }

    public List<Route> getRoutesForStation(Long stationId) {
        return routeRepository.findByStationIdAndActiveTrue(stationId);
    }

    public Optional<RouteFare> getLatestFareForRoute(Long routeId) {
        return routeFareRepository.findLatestFareByRouteId(routeId);
    }
}
