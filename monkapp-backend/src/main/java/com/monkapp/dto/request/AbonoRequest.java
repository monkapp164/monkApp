package com.monkapp.dto.request;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class AbonoRequest {
    private LocalDate fecha;
    @NotBlank private String titulo;
    private String observacion;
    @NotNull @DecimalMin("0.01") private BigDecimal monto;
    @NotNull private Long clienteId;
    private Long ventaId;
}
