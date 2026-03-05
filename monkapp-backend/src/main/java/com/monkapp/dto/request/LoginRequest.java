package com.monkapp.dto.request;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank private String cedula;
    @NotBlank private String password;
}
