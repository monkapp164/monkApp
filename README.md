# 🐒 MonkApp — Guía de inicio

## Requisitos
- Java 17+
- Maven 3.8+
- MySQL 8.0+
- Node.js 18+

---

## 1. Base de datos (MySQL)

```sql
CREATE DATABASE monkapp_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

---

## 2. Backend (Spring Boot)

### Configurar credenciales

Edita `src/main/resources/application.yml` o crea un archivo `.env` con:

```
DB_USERNAME=root
DB_PASSWORD=tu_password_mysql

MAIL_USERNAME=monkapp164@gmail.com
MAIL_PASSWORD=tu_app_password_gmail   # Ver instrucciones abajo

JWT_SECRET=MonkAppSecretKey2024XYZABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmn
```

### App Password de Gmail

1. Ve a tu cuenta Google → Seguridad
2. Activa la Verificación en 2 pasos
3. Ve a "Contraseñas de aplicación"
4. Crea una nueva: Otro → "MonkApp"
5. Copia el código de 16 dígitos → ese es tu MAIL_PASSWORD

### Ejecutar

```bash
cd monkapp-backend
./mvnw spring-boot:run

# Windows:
mvnw.cmd spring-boot:run
```

El servidor arranca en: http://localhost:8080/api

---

## 3. Frontend (React + Vite)

```bash
cd monkapp-frontend
npm install
npm run dev
```

Abre: http://localhost:5173

---

## 4. Endpoints principales

| Método | URL | Descripción |
|--------|-----|-------------|
| POST | /api/auth/registro | Crear cuenta |
| POST | /api/auth/verificar | Verificar correo |
| POST | /api/auth/login | Iniciar sesión (retorna JWT) |
| GET  | /api/dashboard | Resumen general |
| GET  | /api/clientes | Listar clientes |
| POST | /api/clientes | Crear cliente |
| GET  | /api/productos | Listar productos |
| POST | /api/ventas | Crear venta |
| POST | /api/abonos | Registrar abono |
| POST | /api/gastos | Registrar gasto |
| GET  | /api/dashboard/clientes/{id}/pdf | Descargar PDF |
| GET  | /api/configuracion | Ver configuración |
| PUT  | /api/configuracion | Guardar configuración |

---

## 5. Flujo de prueba

1. Registrarse con cédula, nombre, correo y contraseña de 4 dígitos
2. Verificar el código recibido en el correo
3. Iniciar sesión
4. Crear clientes y productos
5. Registrar una venta con abono parcial → se genera deuda automáticamente
6. Desde el detalle del cliente, registrar un abono para reducir la deuda
7. Descargar el PDF del historial del cliente

---

## 6. Estructura de carpetas

```
monkapp/
├── monkapp-backend/          # Spring Boot
│   ├── src/main/java/com/monkapp/
│   │   ├── config/           # SecurityConfig
│   │   ├── controller/       # REST Controllers
│   │   ├── dto/              # Request / Response DTOs
│   │   ├── entity/           # Entidades JPA
│   │   ├── exception/        # Manejo de errores
│   │   ├── repository/       # JPA Repositories
│   │   ├── security/         # JWT (JwtUtil, JwtAuthFilter)
│   │   └── service/          # Lógica de negocio
│   └── src/main/resources/
│       └── application.yml
│
└── monkapp-frontend/         # React + Vite
    └── src/
        ├── api/              # axios con interceptores
        ├── components/       # Layout, Spinner
        ├── context/          # AuthContext
        ├── pages/            # Dashboard, Clientes, etc.
        ├── router/           # AppRouter
        └── services/         # Llamadas a la API
```

---

## 7. Notas de seguridad

- La contraseña de 4 dígitos es hasheada con BCrypt antes de guardarla
- El JWT expira en 24 horas
- Cada usuario solo puede ver sus propios datos (validado en el backend)
- Los correos de verificación expiran en 10 minutos
