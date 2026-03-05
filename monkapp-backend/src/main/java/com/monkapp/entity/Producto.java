package com.monkapp.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "productos", indexes = {
    @Index(name = "idx_producto_usuario", columnList = "usuario_cedula"),
    @Index(name = "idx_producto_stock", columnList = "usuario_cedula,stock")
})
@Data
@NoArgsConstructor
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(length = 500)
    private String descripcion;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;

    @Column
    private Integer stock = 0;

    @Column
    private String categoria;

    @Column(name = "tiene_inventario")
    private Boolean tieneInventario = true;

    @Column(name = "stock_minimo")
    private Integer stockMinimo = 5;

    @Column(name = "activo")
    private Boolean activo = true;

    @Column(name = "creado_en")
    private LocalDateTime creadoEn = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_cedula", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Usuario usuario;
}
