package com.monkapp.controller;

import com.monkapp.dto.request.VentaRequest;
import com.monkapp.entity.Venta;
import com.monkapp.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/ventas")
@RequiredArgsConstructor
public class VentaController {
    private final VentaService ventaService;

    @GetMapping
    public ResponseEntity<List<Venta>> listar() {
        return ResponseEntity.ok(ventaService.listar());
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<Venta>> listarPorCliente(@PathVariable Long clienteId) {
        return ResponseEntity.ok(ventaService.listarPorCliente(clienteId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Venta> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(ventaService.obtener(id));
    }

    @PostMapping
    public ResponseEntity<Venta> crear(@Valid @RequestBody VentaRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ventaService.crear(req));
    }

    @PatchMapping("/{id}/anular")
    public ResponseEntity<Void> anular(@PathVariable Long id) {
        ventaService.anular(id);
        return ResponseEntity.noContent().build();
    }
}