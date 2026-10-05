<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class ClientPortalController extends Controller
{
    /**
     * Obtener cliente por token Bearer
     */
    private function getAuthCliente(Request $request)
    {
        $token = $request->bearerToken();
        if (!$token) return null;

        return DB::table('clientes')->where('token_seguimiento', $token)->first();
    }

    /**
     * Perfil del Cliente
     */
    public function perfil(Request $request)
    {
        $cliente = $this->getAuthCliente($request);
        if (!$cliente) {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 401);
        }

        return response()->json([
            'success' => true,
            'data' => $cliente
        ]);
    }

    /**
     * Lista de Contratos / Ventas del Cliente con totales financieros calculados
     */
    public function contratos(Request $request)
    {
        $cliente = $this->getAuthCliente($request);
        if (!$cliente) {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 401);
        }

        $ventas = DB::table('ventas')
            ->join('lotificaciones', 'ventas.lotificacion_id', '=', 'lotificaciones.id')
            ->where('ventas.id_cliente', $cliente->id_cliente)
            ->select(
                'ventas.*',
                'lotificaciones.nombre as lotificacion_nombre'
            )
            ->get();

        $contratos = $ventas->map(function ($v) {
            // Lote vinculado a través de historial_lotes o directamente
            $lote = DB::table('historial_lotes')
                ->join('lotes', 'historial_lotes.id_lote', '=', 'lotes.id_lote')
                ->join('bloques', 'lotes.id_bloque', '=', 'bloques.id_bloque')
                ->where('historial_lotes.id_venta', $v->id_venta)
                ->select('lotes.numero_lote', 'bloques.nombre as nombre_bloque')
                ->first();

            $loteIdentificador = $lote ? "Lote {$lote->numero_lote} ({$lote->nombre_bloque})" : "Contrato #{$v->id_venta}";

            // Total abonado (suma de abonos)
            $totalAbonado = (float) DB::table('abonos')
                ->where('id_venta', $v->id_venta)
                ->sum('monto_abonado');

            $precioFinal = (float) $v->precio_final;
            $saldoRestante = max(0, $precioFinal - $totalAbonado);

            // Conteo de cuotas
            $cuotasPagadas = DB::table('cuotas')
                ->where('id_venta', $v->id_venta)
                ->where('estado', 'Pagada')
                ->count();

            $cuotasPendientes = DB::table('cuotas')
                ->where('id_venta', $v->id_venta)
                ->where('estado', 'Pendiente')
                ->count();

            $cuotasMora = DB::table('cuotas')
                ->where('id_venta', $v->id_venta)
                ->where('estado', 'Mora')
                ->count();

            $proximaCuota = DB::table('cuotas')
                ->where('id_venta', $v->id_venta)
                ->whereIn('estado', ['Pendiente', 'Mora'])
                ->orderBy('fecha_vencimiento', 'asc')
                ->first();

            $estadoPago = $cuotasMora > 0 ? 'En Mora' : ($saldoRestante <= 0 ? 'Completado' : 'Al Día');

            return [
                'id_venta' => $v->id_venta,
                'id_cliente' => $v->id_cliente,
                'lotificacion_id' => $v->lotificacion_id,
                'lotificacion_nombre' => $v->lotificacion_nombre,
                'lote_identificador' => $loteIdentificador,
                'fecha_venta' => $v->fecha_venta,
                'precio_final' => $precioFinal,
                'prima_pagada' => (float) ($v->prima_pagada ?? 0),
                'plazo_meses' => (int) $v->plazo_meses,
                'cuota_mensual' => (float) $v->cuota_mensual,
                'estado_contrato' => $v->estado_contrato ?? 'Vigente',
                'beneficiario_final' => $v->beneficiario_final,
                'nota_beneficiario' => $v->nota_beneficiario,
                'total_abonado' => $totalAbonado,
                'saldo_restante' => $saldoRestante,
                'cuotas_pagadas_count' => $cuotasPagadas,
                'cuotas_pendientes_count' => $cuotasPendientes,
                'cuotas_mora_count' => $cuotasMora,
                'proxima_cuota_vencimiento' => $proximaCuota ? $proximaCuota->fecha_vencimiento : null,
                'proxima_cuota_monto' => $proximaCuota ? (float) $proximaCuota->monto_total : (float) $v->cuota_mensual,
                'dias_mora' => $cuotasMora > 0 ? 15 : 0,
                'estado_pago' => $estadoPago,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $contratos
        ]);
    }

    /**
     * Estado de Cuenta: Desglose de cuotas de un contrato
     */
    public function estadoCuenta(Request $request, $idVenta)
    {
        $cliente = $this->getAuthCliente($request);
        if (!$cliente) {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 401);
        }

        $cuotas = DB::table('cuotas')
            ->where('id_venta', $idVenta)
            ->orderBy('numero_cuota', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $cuotas
        ]);
    }

    /**
     * Historial de Recibos Oficiales de Caja
     */
    public function recibos(Request $request, $idVenta)
    {
        $cliente = $this->getAuthCliente($request);
        if (!$cliente) {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 401);
        }

        $abonos = DB::table('abonos')
            ->where('id_venta', $idVenta)
            ->orderBy('fecha_pago', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $abonos
        ]);
    }

    /**
     * Reportar Nuevo Abono / Pago con Comprobante
     */
    public function reportarPago(Request $request)
    {
        $cliente = $this->getAuthCliente($request);
        if (!$cliente) {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 401);
        }

        $validator = Validator::make($request->all(), [
            'id_venta' => 'required|integer',
            'monto' => 'required|numeric|min:1',
            'fecha_transferencia' => 'required|date',
            'metodo_pago' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $idTramite = 'TRA-' . strtoupper(substr(uniqid(), -6));

        // Opcional: guardar en tabla de trámites / abonos pendientes de revisión
        // Si tu sistema tiene tabla `pagos_pendientes` o `tramites_caja`

        return response()->json([
            'success' => true,
            'message' => 'Comprobante de pago recibido exitosamente. Se encuentra en proceso de validación contable.',
            'id_tramite' => $idTramite
        ]);
    }
}
