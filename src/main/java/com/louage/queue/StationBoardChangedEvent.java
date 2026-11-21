package com.louage.queue;

public record StationBoardChangedEvent(Long stationId, Long routeId, String reason) {}
