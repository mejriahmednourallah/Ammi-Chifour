package com.louage.station;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "route_fares")
public class RouteFare {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id", nullable = false)
    private Route route;

    @Column(name = "fare_millimes", nullable = false)
    private Integer fareMillimes;

    @Column(name = "valid_from", nullable = false)
    private Instant validFrom = Instant.now();

    public RouteFare() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Route getRoute() { return route; }
    public void setRoute(Route route) { this.route = route; }

    public Integer getFareMillimes() { return fareMillimes; }
    public void setFareMillimes(Integer fareMillimes) { this.fareMillimes = fareMillimes; }

    public Instant getValidFrom() { return validFrom; }
    public void setValidFrom(Instant validFrom) { this.validFrom = validFrom; }

    public Double getFareTnd() {
        return fareMillimes != null ? fareMillimes / 1000.0 : 0.0;
    }
}
