package com.louage.board;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/stations/{id}")
@CrossOrigin(origins = "*")
public class BoardController {

    private final BoardService boardService;
    private final SseHub sseHub;

    public BoardController(BoardService boardService, SseHub sseHub) {
        this.boardService = boardService;
        this.sseHub = sseHub;
    }

    @GetMapping("/board")
    public ResponseEntity<BoardSnapshot> getBoard(@PathVariable("id") Long id) {
        return boardService.getBoardSnapshot(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamBoard(@PathVariable("id") Long id) {
        return sseHub.subscribe(id);
    }
}
