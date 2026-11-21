package com.louage.station;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface RouteFareRepository extends JpaRepository<RouteFare, Long> {

    @Query(value = "SELECT * FROM route_fares WHERE route_id = :routeId ORDER BY valid_from DESC LIMIT 1", nativeQuery = true)
    Optional<RouteFare> findLatestFareByRouteId(@Param("routeId") Long routeId);
}
