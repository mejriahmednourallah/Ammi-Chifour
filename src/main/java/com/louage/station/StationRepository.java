package com.louage.station;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StationRepository extends JpaRepository<Station, Long> {

    @Query("SELECT s FROM Station s WHERE LOWER(s.nameFr) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(s.nameAr) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(s.governorate) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Station> searchByNameOrGovernorate(@Param("query") String query);
}
