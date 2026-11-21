package com.louage.sim;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/sim")
@CrossOrigin(origins = "*")
public class SimController {

    private final SimulatorService simulatorService;

    public SimController(SimulatorService simulatorService) {
        this.simulatorService = simulatorService;
    }

    public record SpeedRequest(Double speed) {}

    @PostMapping("/start")
    public ResponseEntity<Map<String, Object>> start() {
        simulatorService.start();
        return ResponseEntity.ok(Map.of("running", true, "speed", simulatorService.getSpeed()));
    }

    @PostMapping("/stop")
    public ResponseEntity<Map<String, Object>> stop() {
        simulatorService.stop();
        return ResponseEntity.ok(Map.of("running", false, "speed", simulatorService.getSpeed()));
    }

    @PostMapping("/speed")
    public ResponseEntity<Map<String, Object>> speed(@RequestBody SpeedRequest request) {
        double sp = request.speed() != null ? request.speed() : 1.0;
        simulatorService.setSpeed(sp);
        return ResponseEntity.ok(Map.of("running", simulatorService.isRunning(), "speed", simulatorService.getSpeed()));
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status() {
        return ResponseEntity.ok(Map.of(
                "running", simulatorService.isRunning(),
                "speed", simulatorService.getSpeed()
        ));
    }
}
