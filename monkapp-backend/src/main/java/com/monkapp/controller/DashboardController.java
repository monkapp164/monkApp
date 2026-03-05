package com.monkapp.controller;

import com.monkapp.dto.response.DashboardResponse;
import com.monkapp.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final DashboardService dashboardService;
    private final PdfService pdfService;

    @GetMapping
    public ResponseEntity<DashboardResponse> obtener() {
        return ResponseEntity.ok(dashboardService.obtener());
    }

    @GetMapping("/clientes/{id}/pdf")
    public ResponseEntity<byte[]> pdfCliente(@PathVariable Long id) throws Exception {
        byte[] pdf = pdfService.historialCliente(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=historial-cliente-" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
