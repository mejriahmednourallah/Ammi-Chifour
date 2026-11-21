package com.louage.board;

import com.louage.queue.StationBoardChangedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class SseHub {

    private static final Logger log = LoggerFactory.getLogger(SseHub.class);

    // Emitters mapped by station ID
    private final Map<Long, List<SseEmitter>> stationEmitters = new ConcurrentHashMap<>();

    // Timestamp tracker for coalescing
    private final Map<Long, Long> lastPushTime = new ConcurrentHashMap<>();

    private final BoardService boardService;

    public SseHub(BoardService boardService) {
        this.boardService = boardService;
    }

    public SseEmitter subscribe(Long stationId) {
        // 30 minute timeout
        SseEmitter emitter = new SseEmitter(1800_000L);

        stationEmitters.computeIfAbsent(stationId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(stationId, emitter));
        emitter.onTimeout(() -> removeEmitter(stationId, emitter));
        emitter.onError(e -> removeEmitter(stationId, emitter));

        // Push initial snapshot immediately
        boardService.getBoardSnapshot(stationId).ifPresent(snapshot -> {
            try {
                emitter.send(SseEmitter.event()
                        .name("snapshot")
                        .data(snapshot));
            } catch (IOException e) {
                removeEmitter(stationId, emitter);
            }
        });

        return emitter;
    }

    private void removeEmitter(Long stationId, SseEmitter emitter) {
        List<SseEmitter> list = stationEmitters.get(stationId);
        if (list != null) {
            list.remove(emitter);
            if (list.isEmpty()) {
                stationEmitters.remove(stationId);
            }
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onStationBoardChanged(StationBoardChangedEvent event) {
        Long stationId = event.stationId();
        if (stationId == null) return;

        List<SseEmitter> emitters = stationEmitters.get(stationId);
        if (emitters == null || emitters.isEmpty()) return;

        long now = System.currentTimeMillis();
        Long last = lastPushTime.get(stationId);
        // Coalescing: max 2 updates per second (500ms)
        if (last != null && (now - last) < 450) {
            return;
        }
        lastPushTime.put(stationId, now);

        boardService.getBoardSnapshot(stationId).ifPresent(snapshot -> {
            broadcastSnapshot(stationId, snapshot);
        });
    }

    private void broadcastSnapshot(Long stationId, BoardSnapshot snapshot) {
        List<SseEmitter> emitters = stationEmitters.get(stationId);
        if (emitters == null) return;

        List<SseEmitter> failed = new ArrayList<>();
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("snapshot")
                        .data(snapshot));
            } catch (Exception ex) {
                failed.add(emitter);
            }
        }
        for (SseEmitter f : failed) {
            removeEmitter(stationId, f);
        }
    }

    // Heartbeat every 15 seconds to keep proxies from closing connection
    @Scheduled(fixedRate = 15000)
    public void sendHeartbeats() {
        for (Map.Entry<Long, List<SseEmitter>> entry : stationEmitters.entrySet()) {
            List<SseEmitter> list = entry.getValue();
            List<SseEmitter> dead = new ArrayList<>();
            for (SseEmitter emitter : list) {
                try {
                    emitter.send(SseEmitter.event().comment("keep-alive"));
                } catch (Exception e) {
                    dead.add(emitter);
                }
            }
            for (SseEmitter d : dead) {
                removeEmitter(entry.getKey(), d);
            }
        }
    }

    public int getActiveConnectionCount() {
        return stationEmitters.values().stream().mapToInt(List::size).sum();
    }
}
