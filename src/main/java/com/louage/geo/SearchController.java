package com.louage.geo;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/search")
@CrossOrigin(origins = "*")
public class SearchController {

    private final GeoService geoService;

    public SearchController(GeoService geoService) {
        this.geoService = geoService;
    }

    @GetMapping
    public ResponseEntity<List<GeoService.StationDistanceResult>> search(
            @RequestParam(value = "to", required = false) String destination,
            @RequestParam(value = "lat", required = false) Double lat,
            @RequestParam(value = "lon", required = false) Double lon,
            @RequestParam(value = "radius", required = false) Double radiusKm) {
        return ResponseEntity.ok(geoService.findStationsNear(lat, lon, radiusKm, destination));
    }
}
