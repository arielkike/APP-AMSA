<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class PublicShowroomController extends Controller
{
    /**
     * Catálogo de Lotificaciones activas con conteo de lotes disponibles
     */
    public function getLotificaciones()
    {
        $lotificaciones = DB::table('lotificaciones')
            ->where(function($query) {
                $query->where('estado', 'Activo')
                      ->orWhere('estado', 'Activa')
                      ->orWhereNull('estado');
            })
            ->get();

        $data = $lotificaciones->map(function ($item) {
            // Contar lotes disponibles
            $totalLotes = DB::table('lotes')
                ->join('bloques', 'lotes.id_bloque', '=', 'bloques.id_bloque')
                ->where('bloques.lotificacion_id', $item->id)
                ->count();

            $lotesDisponibles = DB::table('lotes')
                ->join('bloques', 'lotes.id_bloque', '=', 'bloques.id_bloque')
                ->where('bloques.lotificacion_id', $item->id)
                ->where('lotes.estado', 'Disponible')
                ->count();

            $precioMinimo = DB::table('lotes')
                ->join('bloques', 'lotes.id_bloque', '=', 'bloques.id_bloque')
                ->where('bloques.lotificacion_id', $item->id)
                ->where('lotes.estado', 'Disponible')
                ->min('lotes.precio_base') ?? 8500;

            return [
                'id' => $item->id,
                'nombre' => $item->nombre,
                'ubicacion' => $item->ubicacion ?? 'Nicaragua',
                'descripcion' => $item->descripcion ?? 'Urbanización con financiamiento directo y entrega inmediata.',
                'estado' => $item->estado ?? 'Activo',
                'imagen_principal' => $item->imagen_principal ?? 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
                'amenidades' => [
                    'Agua Potable',
                    'Energía Eléctrica',
                    'Calles de Acceso',
                    'Documentación en Regla'
                ],
                'total_lotes' => $totalLotes,
                'lotes_disponibles' => $lotesDisponibles,
                'precio_desde' => (float) $precioMinimo,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    /**
     * Inventario de lotes por proyecto inmobiliario
     */
    public function getLotes($id)
    {
        $lotes = DB::table('lotes')
            ->join('bloques', 'lotes.id_bloque', '=', 'bloques.id_bloque')
            ->join('lotificaciones', 'bloques.lotificacion_id', '=', 'lotificaciones.id')
            ->where('lotificaciones.id', $id)
            ->whereIn('lotes.estado', ['Disponible', 'Reservado'])
            ->select(
                'lotes.id_lote',
                'lotes.id_bloque',
                'bloques.nombre as nombre_bloque',
                'lotificaciones.id as lotificacion_id',
                'lotificaciones.nombre as lotificacion_nombre',
                'lotes.numero_lote',
                'lotes.area_metros',
                'lotes.precio_base',
                'lotes.estado'
            )
            ->get();

        $factorConversion = 1.418415; // 1 m² = 1.418415 vrs²

        $lotesFormateados = $lotes->map(function ($l) use ($factorConversion) {
            $areaMetros = (float) $l->area_metros;
            $areaVaras = round($areaMetros * $factorConversion, 2);
            $precioBase = (float) $l->precio_base;
            $precioVara = $areaVaras > 0 ? round($precioBase / $areaVaras, 2) : 0;

            return [
                'id_lote' => $l->id_lote,
                'id_bloque' => $l->id_bloque,
                'nombre_bloque' => $l->nombre_bloque,
                'lotificacion_id' => $l->lotificacion_id,
                'lotificacion_nombre' => $l->lotificacion_nombre,
                'numero_lote' => $l->numero_lote,
                'area_metros' => $areaMetros,
                'area_varas' => $areaVaras,
                'precio_base' => $precioBase,
                'precio_vara' => $precioVara,
                'estado' => $l->estado ?? 'Disponible',
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $lotesFormateados
        ]);
    }

    /**
     * Lista de Cuentas Bancarias de la Empresa
     */
    public function getCuentasBancarias()
    {
        $cuentas = DB::table('cuentas_bancarias')
            ->where(function($q) {
                $q->where('estado', 'Activa')->orWhere('estado', 'Activo')->orWhereNull('estado');
            })
            ->get();

        // Si la tabla no tiene datos en el momento, devolver cuentas predeterminadas
        if ($cuentas->isEmpty()) {
            return response()->json([
                'success' => true,
                'data' => [
                    [
                        'id' => 1,
                        'banco' => 'BAC Credomatic',
                        'numero_cuenta' => '365-894120-1',
                        'tipo_cuenta' => 'Corriente',
                        'moneda' => 'USD',
                        'titular' => 'PROYECTOS SAN MIGUEL S.A.'
                    ],
                    [
                        'id' => 2,
                        'banco' => 'BAC Credomatic',
                        'numero_cuenta' => '365-894125-9',
                        'tipo_cuenta' => 'Corriente',
                        'moneda' => 'NIO',
                        'titular' => 'PROYECTOS SAN MIGUEL S.A.'
                    ],
                    [
                        'id' => 3,
                        'banco' => 'Banco LAFISE Bancentro',
                        'numero_cuenta' => '109-245890-0',
                        'tipo_cuenta' => 'Ahorro',
                        'moneda' => 'USD',
                        'titular' => 'PROYECTOS SAN MIGUEL S.A.'
                    ]
                ]
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $cuentas
        ]);
    }

    /**
     * Cálculo de financiamiento en el simulador
     */
    public function simularCuotas(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'precio_lote' => 'required|numeric|min:1',
            'monto_prima' => 'required|numeric|min:0',
            'plazo_meses' => 'required|integer|min:1|max:120',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $precio = (float) $request->precio_lote;
        $prima = (float) $request->monto_prima;
        $plazo = (int) $request->plazo_meses;
        $montoFinanciar = max(0, $precio - $prima);

        $cuotaMensual = round($montoFinanciar / $plazo, 2);

        $tabla = [];
        $saldo = $montoFinanciar;
        for ($i = 1; $i <= $plazo; $i++) {
            $saldo = max(0, $saldo - $cuotaMensual);
            $tabla[] = [
                'mes' => $i,
                'cuota' => $cuotaMensual,
                'capital' => $cuotaMensual,
                'interes' => 0.00,
                'saldo' => round($saldo, 2),
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'monto_financiar' => $montoFinanciar,
                'cuota_mensual' => $cuotaMensual,
                'prima_minima' => round($precio * 0.10, 2),
                'total_financiamiento' => round($prima + ($cuotaMensual * $plazo), 2),
                'tabla_amortizacion' => $tabla
            ]
        ]);
    }

    /**
     * Registro de Pre-Reserva Digital Express
     */
    public function registrarPreReserva(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_lote' => 'required|integer',
            'lotificacion_id' => 'required|integer',
            'nombres_apellidos' => 'required|string|max:200',
            'identificacion' => 'required|string|max:30',
            'telefono' => 'required|string|max:50',
            'monto_anticipo' => 'required|numeric|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $codigoReserva = 'RES-' . strtoupper(substr(uniqid(), -6));

        // Crear o buscar cliente
        $clienteId = DB::table('clientes')->where('identificacion', $request->identificacion)->value('id_cliente');

        if (!$clienteId) {
            $clienteId = DB::table('clientes')->insertGetId([
                'expediente_num' => 'TEMP-' . strtoupper(substr(uniqid(), -5)),
                'nombres_apellidos' => $request->nombres_apellidos,
                'identificacion' => $request->identificacion,
                'telefono' => $request->telefono,
                'direccion' => $request->direccion ?? '',
                'token_seguimiento' => $codigoReserva,
                'created_at' => now(),
            ]);
        }

        // Registrar en tabla reservas
        DB::table('reservas')->insert([
            'id_cliente' => $clienteId,
            'lotificacion_id' => $request->lotificacion_id,
            'fecha_reserva' => now()->toDateString(),
            'monto_reserva' => $request->monto_anticipo,
            'estado' => 'Activa',
        ]);

        // Cambiar lote a Reservado
        DB::table('lotes')->where('id_lote', $request->id_lote)->update(['estado' => 'Reservado']);

        return response()->json([
            'success' => true,
            'message' => 'Pre-reserva registrada con éxito. Un asesor validará tu pago en breve.',
            'codigo_reserva' => $codigoReserva
        ]);
    }
}
