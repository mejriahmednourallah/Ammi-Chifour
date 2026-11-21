package com.louage.fleet;

import jakarta.persistence.*;

@Entity
@Table(name = "vehicles")
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "plate", nullable = false, unique = true)
    private String plate;

    @Column(name = "driver_name")
    private String driverName;

    @Column(name = "capacity", nullable = false)
    private Short capacity = 8;

    public Vehicle() {}

    public Vehicle(Long id, String plate, String driverName, Short capacity) {
        this.id = id;
        this.plate = plate;
        this.driverName = driverName;
        this.capacity = capacity != null ? capacity : 8;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPlate() { return plate; }
    public void setPlate(String plate) { this.plate = plate; }

    public String getDriverName() { return driverName; }
    public void setDriverName(String driverName) { this.driverName = driverName; }

    public Short getCapacity() { return capacity; }
    public void setCapacity(Short capacity) { this.capacity = capacity; }
}
