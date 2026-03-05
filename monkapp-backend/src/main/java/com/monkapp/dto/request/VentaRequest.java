package com.monkapp.dto.request;
import com.monkapp.entity.Venta;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class VentaRequest {
    private LocalDate fecha;
    @NotNull private Venta.TipoVenta tipoVenta;
    private Venta.MetodoPago metodoPago;
    private Long clienteId;
    @Min(1) @Max(8) private Integer numeroCuotas = 1;
    private BigDecimal descuento;
    private BigDecimal abonoInicial;
    private String concepto;
    @NotEmpty private List<DetalleRequest> detalles;
}
