package com.louage.station;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RouteRepository extends JpaRepository<Route, Long> {

    List<Route> findByStationIdAndActiveTrue(Long stationId);

    @Query("SELECT r FROM Route r WHERE r.active = true AND " +
           "(LOWER(r.destinationNameFr) = LOWER(:destination) OR LOWER(r.destinationNameAr) = LOWER(:destination))")
    List<Route> findByDestination(@Param("destination") String destination);

    Optional<Route> findByStationIdAndDestinationNameFrIgnoreCase(Long stationId, String destinationNameFr);
}
