package com.monkapp.dto.response;
import com.monkapp.entity.Cliente;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class DashboardResponse {
    private BigDecimal totalPorCobrar;
    private BigDecimal totalPorPagar;
    private Long totalClientes;
    private Long totalProductos;
    private List<Cliente> clientesConDeuda;
}
