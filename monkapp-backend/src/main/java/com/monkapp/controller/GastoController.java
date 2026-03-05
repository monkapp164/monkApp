package com.monkapp.controller;

import com.monkapp.dto.request.GastoRequest;
import com.monkapp.entity.Gasto;
import com.monkapp.service.GastoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/gastos")
@RequiredArgsConstructor
public class GastoController {
    private final GastoService gastoService;

    @GetMapping
    public ResponseEntity<List<Gasto>> listar() {
        return ResponseEntity.ok(gastoService.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Gasto> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(gastoService.obtener(id));
    }

    @PostMapping
    public ResponseEntity<Gasto> crear(@Valid @RequestBody GastoRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(gastoService.crear(req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        gastoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
