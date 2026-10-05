<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Login de Propietario/Cliente por Cédula + Expediente (o Token)
     */
    public function loginCliente(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'identificacion' => 'required|string',
            'expediente_num' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Por favor proporciona tu número de cédula y expediente.',
                'errors' => $validator->errors()
            ], 422);
        }

        // Limpiar cédula y expediente para búsqueda flexible
        $identificacion = trim($request->identificacion);
        $expediente = trim($request->expediente_num);

        $cliente = DB::table('clientes')
            ->where(function($q) use ($identificacion) {
                $cleanId = str_replace('-', '', $identificacion);
                $q->where('identificacion', $identificacion)
                  ->orWhereRaw("REPLACE(identificacion, '-', '') = ?", [$cleanId]);
            })
            ->where(function($q) use ($expediente) {
                $q->where('expediente_num', $expediente)
                  ->orWhere('token_seguimiento', $expediente)
                  ->orWhere('pv_num', $expediente);
            })
            ->first();

        if (!$cliente) {
            return response()->json([
                'success' => false,
                'message' => 'No se encontró ningún cliente con esa combinación de Cédula y Expediente.'
            ], 401);
        }

        // Generar token Bearer de sesión
        $token = 'amsamovil_' . Str::random(40);

        // Guardar token en tabla de clientes o personal_access_tokens si usan Sanctum
        DB::table('clientes')->where('id_cliente', $cliente->id_cliente)->update([
            'token_seguimiento' => $token,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Inicio de sesión exitoso.',
            'data' => [
                'token' => $token,
                'cliente' => [
                    'id_cliente' => $cliente->id_cliente,
                    'expediente_num' => $cliente->expediente_num,
                    'pv_num' => $cliente->pv_num,
                    'nombres_apellidos' => $cliente->nombres_apellidos,
                    'identificacion' => $cliente->identificacion,
                    'telefono' => $cliente->telefono,
                    'email' => $cliente->email ?? '',
                    'direccion' => $cliente->direccion ?? '',
                    'token_seguimiento' => $token,
                ]
            ]
        ]);
    }

    /**
     * Cierre de sesión
     */
    public function logout(Request $request)
    {
        $token = $request->bearerToken();
        if ($token) {
            DB::table('clientes')->where('token_seguimiento', $token)->update([
                'token_seguimiento' => null
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Sesión cerrada correctamente.'
        ]);
    }
}
