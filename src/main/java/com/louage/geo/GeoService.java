package com.louage.geo;

import com.louage.board.BoardService;
import com.louage.board.BoardSnapshot;
import com.louage.station.Route;
import com.louage.station.RouteRepository;
import com.louage.station.Station;
import com.louage.station.StationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional(readOnly = true)
public class GeoService {

    private final StationRepository stationRepository;
    private final RouteRepository routeRepository;
    private final BoardService boardService;

    public GeoService(StationRepository stationRepository,
                      RouteRepository routeRepository,
                      BoardService boardService) {
        this.stationRepository = stationRepository;
        this.routeRepository = routeRepository;
        this.boardService = boardService;
    }

    public record StationDistanceResult(
            Station station,
            double distanceKm,
            List<Route> matchingRoutes,
            BoardSnapshot previewSnapshot
    ) {}

    public List<StationDistanceResult> findStationsNear(Double lat, Double lon, Double radiusKm, String destination) {
        List<Station> all = stationRepository.findAll();
        List<StationDistanceResult> results = new ArrayList<>();

        double userLat = lat != null ? lat : 36.7865; // Default Tunis center
        double userLon = lon != null ? lon : 10.1812;
        double maxRadius = radiusKm != null ? radiusKm : 50.0;

        for (Station s : all) {
            double dist = calculateHaversineKm(userLat, userLon, s.getLatitude(), s.getLongitude());
            if (dist <= maxRadius) {
                List<Route> routes = routeRepository.findByStationIdAndActiveTrue(s.getId());
                List<Route> matching = routes;
                if (destination != null && !destination.isBlank()) {
                    String dLower = destination.trim().toLowerCase();
                    matching = routes.stream()
                            .filter(r -> r.getDestinationNameFr().toLowerCase().contains(dLower) ||
                                         r.getDestinationNameAr().contains(dLower))
                            .toList();
                }

                if (destination == null || destination.isBlank() || !matching.isEmpty()) {
                    BoardSnapshot snapshot = boardService.buildSnapshot(s);
                    results.add(new StationDistanceResult(s, Math.round(dist * 10.0) / 10.0, matching, snapshot));
                }
            }
        }

        results.sort(Comparator.comparingDouble(StationDistanceResult::distanceKm));
        return results;
    }

    private double calculateHaversineKm(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth radius in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
