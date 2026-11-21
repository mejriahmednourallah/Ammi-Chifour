package com.louage.station;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/stations")
@CrossOrigin(origins = "*")
public class StationController {

    private final StationService stationService;

    public StationController(StationService stationService) {
        this.stationService = stationService;
    }

    @GetMapping
    public ResponseEntity<List<Station>> getStations(@RequestParam(value = "query", required = false) String query) {
        return ResponseEntity.ok(stationService.searchStations(query));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Station> getStation(@PathVariable("id") Long id) {
        return stationService.getStationById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/routes")
    public ResponseEntity<List<Route>> getRoutes(@PathVariable("id") Long id) {
        return ResponseEntity.ok(stationService.getRoutesForStation(id));
    }
}
