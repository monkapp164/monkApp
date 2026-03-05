package com.monkapp.controller;

import com.monkapp.dto.request.*;
import com.monkapp.dto.response.*;
import com.monkapp.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/registro")
    public ResponseEntity<ApiResponse> registro(@Valid @RequestBody RegistroRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.registrar(req));
    }

    @PostMapping("/verificar")
    public ResponseEntity<ApiResponse> verificar(@Valid @RequestBody VerificacionRequest req) {
        return ResponseEntity.ok(authService.verificar(req));
    }

    @PostMapping("/reenviar-codigo")
    public ResponseEntity<ApiResponse> reenviar(@RequestParam String correo) {
        return ResponseEntity.ok(authService.reenviarCodigo(correo));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }
}
