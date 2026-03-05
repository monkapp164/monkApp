package com.monkapp.dto.request;
import com.monkapp.entity.Venta;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class GastoRequest {
    private LocalDate fecha;
    @NotBlank private String categoria;
    @NotNull @DecimalMin("0.01") private BigDecimal valor;
    private BigDecimal valorPagado;
    private Venta.MetodoPago metodoPago;
    private String descripcion;
    private Long proveedorId;
}
