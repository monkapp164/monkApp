package com.monkapp.dto.request;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VerificacionRequest {
    @NotBlank private String correo;
    @NotBlank private String codigo;
}
