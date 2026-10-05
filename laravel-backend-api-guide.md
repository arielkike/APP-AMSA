# 📚 GUÍA DE INTEGRACIÓN BACKEND LARAVEL + BASE DE DATOS `app-amsa-db`

Este documento contiene la estructura SQL recomendada para tu base de datos local `app-amsa-db` en phpMyAdmin y los controladores/rutas en Laravel para conectar la aplicación móvil **San Miguel Móvil**.

---

## 1. Estructura de Tablas SQL para `app-amsa-db`

Ejecuta el siguiente script en la pestaña **SQL** de tu phpMyAdmin en la base de datos `app-amsa-db`:

```sql
-- 1. Tabla de Lotificaciones (Proyectos)
CREATE TABLE IF NOT EXISTS `lotificaciones` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(150) NOT NULL,
  `ubicacion` TEXT NOT NULL,
  `descripcion` TEXT NULL,
  `imagen_principal` VARCHAR(255) NULL,
  `estado` ENUM('Activo', 'Inactivo') DEFAULT 'Activo',
  `precio_desde` DECIMAL(12,2) DEFAULT 0.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Tabla de Bloques
CREATE TABLE IF NOT EXISTS `bloques` (
  `id_bloque` INT AUTO_INCREMENT PRIMARY KEY,
  `lotificacion_id` INT NOT NULL,
  `nombre` VARCHAR(50) NOT NULL,
  FOREIGN KEY (`lotificacion_id`) REFERENCES `lotificaciones`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Tabla de Lotes
CREATE TABLE IF NOT EXISTS `lotes` (
  `id_lote` INT AUTO_INCREMENT PRIMARY KEY,
  `id_bloque` INT NOT NULL,
  `numero_lote` VARCHAR(50) NOT NULL,
  `area_metros` DECIMAL(10,2) NOT NULL,
  `precio_base` DECIMAL(12,2) NOT NULL,
  `estado` ENUM('Disponible', 'Reservado', 'Vendido') DEFAULT 'Disponible',
  FOREIGN KEY (`id_bloque`) REFERENCES `bloques`(`id_bloque`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Tabla de Clientes
CREATE TABLE IF NOT EXISTS `clientes` (
  `id_cliente` INT AUTO_INCREMENT PRIMARY KEY,
  `expediente_num` VARCHAR(50) UNIQUE NOT NULL,
  `pv_num` VARCHAR(50) NULL,
  `nombres_apellidos` VARCHAR(200) NOT NULL,
  `identificacion` VARCHAR(30) UNIQUE NOT NULL,
  `telefono` VARCHAR(50) NOT NULL,
  `email` VARCHAR(100) NULL,
  `direccion` TEXT NULL,
  `token_seguimiento` VARCHAR(100) NULL,
  `fcm_push_token` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Tabla de Ventas (Contratos)
CREATE TABLE IF NOT EXISTS `ventas` (
  `id_venta` INT AUTO_INCREMENT PRIMARY KEY,
  `id_cliente` INT NOT NULL,
  `lotificacion_id` INT NOT NULL,
  `fecha_venta` DATE NOT NULL,
  `precio_final` DECIMAL(12,2) NOT NULL,
  `prima_pagada` DECIMAL(12,2) DEFAULT 0.00,
  `plazo_meses` INT NOT NULL,
  `cuota_mensual` DECIMAL(12,2) NOT NULL,
  `estado_contrato` ENUM('Vigente', 'Finalizado', 'Rescindido') DEFAULT 'Vigente',
  `beneficiario_final` VARCHAR(200) NULL,
  `nota_beneficiario` TEXT NULL,
  FOREIGN KEY (`id_cliente`) REFERENCES `clientes`(`id_cliente`),
  FOREIGN KEY (`lotificacion_id`) REFERENCES `lotificaciones`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Tabla de Cuotas (Amortización)
CREATE TABLE IF NOT EXISTS `cuotas` (
  `id_cuota` INT AUTO_INCREMENT PRIMARY KEY,
  `id_venta` INT NOT NULL,
  `numero_cuota` INT NOT NULL,
  `fecha_vencimiento` DATE NOT NULL,
  `monto_total` DECIMAL(12,2) NOT NULL,
  `capital` DECIMAL(12,2) NOT NULL,
  `saldo_restante` DECIMAL(12,2) NOT NULL,
  `mora_pendiente` DECIMAL(12,2) DEFAULT 0.00,
  `estado` ENUM('Pagada', 'Pendiente', 'Mora', 'Parcial') DEFAULT 'Pendiente',
  FOREIGN KEY (`id_venta`) REFERENCES `ventas`(`id_venta`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Tabla de Abonos (Recibos de Caja)
CREATE TABLE IF NOT EXISTS `abonos` (
  `id_abono` INT AUTO_INCREMENT PRIMARY KEY,
  `id_venta` INT NOT NULL,
  `numero_recibo` VARCHAR(50) UNIQUE NOT NULL,
  `codigo_recibo` VARCHAR(50) NULL,
  `fecha_pago` DATE NOT NULL,
  `monto_abonado` DECIMAL(12,2) NOT NULL,
  `tipo_pago` VARCHAR(100) NOT NULL,
  `metodo_pago` ENUM('Efectivo', 'Transferencia Bancaria', 'Depósito Bancario') NOT NULL,
  `referencia` VARCHAR(100) NULL,
  `cuenta_destino` VARCHAR(100) NULL,
  `ruta_recibo` VARCHAR(255) NULL,
  `recibo_firmado` TINYINT(1) DEFAULT 1,
  FOREIGN KEY (`id_venta`) REFERENCES `ventas`(`id_venta`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Cuentas Bancarias de la Empresa
CREATE TABLE IF NOT EXISTS `cuentas_bancarias` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `banco` VARCHAR(100) NOT NULL,
  `numero_cuenta` VARCHAR(100) NOT NULL,
  `tipo_cuenta` VARCHAR(50) NOT NULL,
  `moneda` VARCHAR(10) NOT NULL,
  `titular` VARCHAR(150) NOT NULL,
  `estado` ENUM('Activa', 'Inactiva') DEFAULT 'Activa'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 2. Configuración en Laravel (`routes/api.php`)

```php
use App\Http\Controllers\Api\PublicShowroomController;
use App\Http\Controllers\Api\ClientPortalController;
use App\Http\Controllers\Api\AuthController;

Route::prefix('v1')->group(function () {
    // Endpoints Públicos
    Route::get('/public/lotificaciones', [PublicShowroomController::class, 'getLotificaciones']);
    Route::get('/public/lotificaciones/{id}/lotes', [PublicShowroomController::class, 'getLotes']);
    Route::post('/public/simulador', [PublicShowroomController::class, 'simularCuotas']);
    Route::post('/public/pre-reservas', [PublicShowroomController::class, 'registrarPreReserva']);
    Route::get('/public/cuentas-bancarias', [PublicShowroomController::class, 'getCuentasBancarias']);

    // Auth Cliente
    Route::post('/auth/login-cliente', [AuthController::class, 'loginCliente']);

    // Portal Protegido Cliente
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/cliente/perfil', [ClientPortalController::class, 'perfil']);
        Route::get('/cliente/contratos', [ClientPortalController::class, 'contratos']);
        Route::get('/cliente/contratos/{id_venta}/estado-cuenta', [ClientPortalController::class, 'estadoCuenta']);
        Route::get('/cliente/contratos/{id_venta}/recibos', [ClientPortalController::class, 'recibos']);
        Route::post('/cliente/reportar-pago', [ClientPortalController::class, 'reportarPago']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
    });
});
```
