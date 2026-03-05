package com.monkapp.dto.request;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class DetalleRequest {
    private Long productoId;
    private String nombreProducto;
    private BigDecimal precioUnitario;
    @NotNull @Min(1) private Integer cantidad;
}
