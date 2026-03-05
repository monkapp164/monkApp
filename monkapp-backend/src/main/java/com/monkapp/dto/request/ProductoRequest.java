package com.monkapp.dto.request;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductoRequest {
    @NotBlank private String nombre;
    private String descripcion;
    @NotNull @DecimalMin("0.0") private BigDecimal precio;
    private Integer stock = 0;
    private String categoria;
    private Boolean tieneInventario = true;
    private Integer stockMinimo = 5;
}
