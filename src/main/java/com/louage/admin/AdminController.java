package com.louage.admin;

import com.louage.board.SseHub;
import com.louage.fleet.VehicleRepository;
import com.louage.queue.QueueRepository;
import com.louage.queue.QueueStatus;
import com.louage.sim.SimulatorService;
import com.louage.station.RouteRepository;
import com.louage.station.StationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final StationRepository stationRepository;
    private final RouteRepository routeRepository;
    private final VehicleRepository vehicleRepository;
    private final QueueRepository queueRepository;
    private final SseHub sseHub;
    private final SimulatorService simulatorService;

    public AdminController(StationRepository stationRepository,
                           RouteRepository routeRepository,
                           VehicleRepository vehicleRepository,
                           QueueRepository queueRepository,
                           SseHub sseHub,
                           SimulatorService simulatorService) {
        this.stationRepository = stationRepository;
        this.routeRepository = routeRepository;
        this.vehicleRepository = vehicleRepository;
        this.queueRepository = queueRepository;
        this.sseHub = sseHub;
        this.simulatorService = simulatorService;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        long stationCount = stationRepository.count();
        long routeCount = routeRepository.count();
        long vehicleCount = vehicleRepository.count();
        long activeQueues = queueRepository.findAll().stream()
                .filter(q -> List.of(QueueStatus.BOARDING, QueueStatus.QUEUED, QueueStatus.FULL).contains(q.getStatus()))
                .count();

        return ResponseEntity.ok(Map.of(
                "stationsCount", stationCount,
                "routesCount", routeCount,
                "vehiclesCount", vehicleCount,
                "activeQueueEntries", activeQueues,
                "activeSseConnections", sseHub.getActiveConnectionCount(),
                "simulatorRunning", simulatorService.isRunning(),
                "simulatorSpeed", simulatorService.getSpeed()
        ));
    }
}
