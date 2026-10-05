<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\AdminLotificacionController;

/*
|--------------------------------------------------------------------------
| Web Routes - Módulo de Administración de Contenido para App Móvil
|--------------------------------------------------------------------------
*/

Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('/lotificaciones', [AdminLotificacionController::class, 'index'])->name('lotificaciones.index');
    Route::get('/lotificaciones/{id}/editar', [AdminLotificacionController::class, 'edit'])->name('lotificaciones.edit');
    Route::put('/lotificaciones/{id}', [AdminLotificacionController::class, 'update'])->name('lotificaciones.update');
});
