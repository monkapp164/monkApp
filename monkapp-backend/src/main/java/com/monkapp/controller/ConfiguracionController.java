package com.monkapp.controller;

import com.monkapp.entity.ConfiguracionUsuario;
import com.monkapp.service.ConfiguracionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/configuracion")
@RequiredArgsConstructor
public class ConfiguracionController {
    private final ConfiguracionService configuracionService;

    @GetMapping
    public ResponseEntity<ConfiguracionUsuario> obtener() {
        return ResponseEntity.ok(configuracionService.obtener());
    }

    @PutMapping
    public ResponseEntity<ConfiguracionUsuario> actualizar(
            @RequestBody ConfiguracionUsuario cfg) {
        return ResponseEntity.ok(configuracionService.actualizar(cfg));
    }
}
