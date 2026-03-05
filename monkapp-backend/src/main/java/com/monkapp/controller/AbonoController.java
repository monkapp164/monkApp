package com.monkapp.controller;

import com.monkapp.dto.request.AbonoRequest;
import com.monkapp.entity.Abono;
import com.monkapp.service.AbonoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/abonos")
@RequiredArgsConstructor
public class AbonoController {
    private final AbonoService abonoService;

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<Abono>> listar(@PathVariable Long clienteId) {
        return ResponseEntity.ok(abonoService.listarPorCliente(clienteId));
    }

    @PostMapping
    public ResponseEntity<Abono> registrar(@Valid @RequestBody AbonoRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(abonoService.registrar(req));
    }
}
