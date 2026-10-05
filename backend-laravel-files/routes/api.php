<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PublicShowroomController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClientPortalController;

/*
|--------------------------------------------------------------------------
| API Routes - San Miguel Móvil (AMSAsystem)
| Base: /api/v1/
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // ==================== ENDPOINTS PÚBLICOS (MODO PROSPECTOS) ====================
    Route::get('/public/lotificaciones', [PublicShowroomController::class, 'getLotificaciones']);
    Route::get('/public/lotificaciones/{id}/lotes', [PublicShowroomController::class, 'getLotes']);
    Route::get('/public/cuentas-bancarias', [PublicShowroomController::class, 'getCuentasBancarias']);
    Route::post('/public/simulador', [PublicShowroomController::class, 'simularCuotas']);
    Route::post('/public/pre-reservas', [PublicShowroomController::class, 'registrarPreReserva']);

    // ==================== AUTENTICACIÓN ====================
    Route::post('/auth/login-cliente', [AuthController::class, 'loginCliente']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // ==================== ÁREA PRIVADA CLIENTES ====================
    Route::get('/cliente/perfil', [ClientPortalController::class, 'perfil']);
    Route::get('/cliente/contratos', [ClientPortalController::class, 'contratos']);
    Route::get('/cliente/contratos/{id_venta}/estado-cuenta', [ClientPortalController::class, 'estadoCuenta']);
    Route::get('/cliente/contratos/{id_venta}/recibos', [ClientPortalController::class, 'recibos']);
    Route::post('/cliente/reportar-pago', [ClientPortalController::class, 'reportarPago']);
});
