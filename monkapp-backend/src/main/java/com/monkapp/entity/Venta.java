package com.monkapp.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "ventas", indexes = {
        @Index(name = "idx_venta_usuario_fecha", columnList = "usuario_cedula,fecha"),
        @Index(name = "idx_venta_cliente", columnList = "cliente_id"),
        @Index(name = "idx_venta_estado", columnList = "estado")
})
@Data
@NoArgsConstructor
public class Venta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate fecha;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_venta", nullable = false)
    private TipoVenta tipoVenta;

    @Enumerated(EnumType.STRING)
    @Column(name = "metodo_pago")
    private MetodoPago metodoPago;

    @Column(name = "total", nullable = false, precision = 12, scale = 2)
    private BigDecimal total;

    @Column(name = "descuento", precision = 10, scale = 2)
    private BigDecimal descuento = BigDecimal.ZERO;

    @Column(name = "abono_inicial", precision = 12, scale = 2)
    private BigDecimal abonoInicial = BigDecimal.ZERO;

    @Column(name = "saldo_pendiente", precision = 12, scale = 2)
    private BigDecimal saldoPendiente = BigDecimal.ZERO;

    @Column(name = "numero_cuotas")
    private Integer numeroCuotas = 1;

    @Column(length = 500)
    private String concepto;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado")
    private EstadoVenta estado = EstadoVenta.ACTIVA;

    @Column(name = "creado_en")
    private LocalDateTime creadoEn = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_cedula", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "ventas", "abonos"})
    private Cliente cliente;

    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<DetalleVenta> detalles;

    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Abono> abonos;

    public enum TipoVenta { CON_INVENTARIO, LIBRE, COTIZACION }
    public enum MetodoPago { EFECTIVO, TARJETA, TRANSFERENCIA, NEQUI, DAVIPLATA, OTRO }
    public enum EstadoVenta { ACTIVA, PAGADA, ANULADA }
}