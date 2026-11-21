package com.louage.fleet;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Service
@Transactional
public class FleetService {

    private final VehicleRepository vehicleRepository;

    public FleetService(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    public Vehicle getOrCreateVehicle(String plate, String driverName, Short capacity) {
        return vehicleRepository.findByPlate(plate.trim())
                .orElseGet(() -> vehicleRepository.save(new Vehicle(null, plate.trim(), driverName, capacity != null ? capacity : 8)));
    }
}
