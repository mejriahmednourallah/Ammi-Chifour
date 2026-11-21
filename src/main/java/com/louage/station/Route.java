package com.louage.station;

import jakarta.persistence.*;

@Entity
@Table(name = "routes")
public class Route {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "station_id", nullable = false)
    private Station station;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_station_id")
    private Station destinationStation;

    @Column(name = "destination_name_fr", nullable = false)
    private String destinationNameFr;

    @Column(name = "destination_name_ar", nullable = false)
    private String destinationNameAr;

    @Column(name = "distance_km", nullable = false)
    private Integer distanceKm;

    @Column(name = "estimated_duration_min", nullable = false)
    private Integer estimatedDurationMin;

    @Column(name = "active", nullable = false)
    private Boolean active = true;

    public Route() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Station getStation() { return station; }
    public void setStation(Station station) { this.station = station; }

    public Station getDestinationStation() { return destinationStation; }
    public void setDestinationStation(Station destinationStation) { this.destinationStation = destinationStation; }

    public String getDestinationNameFr() { return destinationNameFr; }
    public void setDestinationNameFr(String destinationNameFr) { this.destinationNameFr = destinationNameFr; }

    public String getDestinationNameAr() { return destinationNameAr; }
    public void setDestinationNameAr(String destinationNameAr) { this.destinationNameAr = destinationNameAr; }

    public Integer getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Integer distanceKm) { this.distanceKm = distanceKm; }

    public Integer getEstimatedDurationMin() { return estimatedDurationMin; }
    public void setEstimatedDurationMin(Integer estimatedDurationMin) { this.estimatedDurationMin = estimatedDurationMin; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
