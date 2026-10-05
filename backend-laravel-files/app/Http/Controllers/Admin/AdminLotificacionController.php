<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class AdminLotificacionController extends Controller
{
    /**
     * Listado administrativo de lotificaciones
     */
    public function index()
    {
        $lotificaciones = DB::table('lotificaciones')->get();
        return view('admin.lotificaciones.index', compact('lotificaciones'));
    }

    /**
     * Formulario de edición de un proyecto / lotificación
     */
    public function edit($id)
    {
        $lotificacion = DB::table('lotificaciones')->where('id', $id)->first();
        if (!$lotificacion) {
            return redirect()->back()->with('error', 'Proyecto no encontrado.');
        }

        $amenidadesDisponibles = [
            'Agua Potable 24/7',
            'Energía Eléctrica',
            'Calles Adoquinadas',
            'Parque Infantil',
            'Alumbrado Público',
            'Seguridad Privada',
            'Fácil Acceso Pavimentado',
            'Pozo Propio',
            'Clima Fresco de Montaña'
        ];

        return view('admin.lotificaciones.edit', compact('lotificacion', 'amenidadesDisponibles'));
    }

    /**
     * Guardar cambios de fotos, ubicación, descripción y amenidades
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:150',
            'ubicacion' => 'required|string',
            'descripcion' => 'nullable|string',
            'precio_desde' => 'nullable|numeric|min:0',
            'imagen_principal' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120', // Hasta 5MB
            'coordenadas_lat' => 'nullable|numeric',
            'coordenadas_lng' => 'nullable|numeric',
            'amenidades' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        $updateData = [
            'nombre' => $request->nombre,
            'ubicacion' => $request->ubicacion,
            'descripcion' => $request->descripcion,
            'precio_desde' => $request->precio_desde ?? 0.00,
            'estado' => $request->estado ?? 'Activo',
            'updated_at' => now(),
        ];

        // Procesar subida de nueva imagen principal
        if ($request->hasFile('imagen_principal')) {
            $file = $request->file('imagen_principal');
            $fileName = 'proyecto_' . $id . '_' . time() . '.' . $file->getClientOriginalExtension();
            
            // Guardar en public/uploads/lotificaciones/
            $path = $file->storeAs('uploads/lotificaciones', $fileName, 'public');
            $url = asset('storage/' . $path);

            $updateData['imagen_principal'] = $url;
        }

        DB::table('lotificaciones')->where('id', $id)->update($updateData);

        return redirect()->route('admin.lotificaciones.index')
            ->with('success', '¡Información y fotografías del proyecto actualizadas con éxito!');
    }

    /**
     * Endpoint API para guardar desde cualquier cliente web moderno
     */
    public function apiUpdate(Request $request, $id)
    {
        $updateData = $request->only(['nombre', 'ubicacion', 'descripcion', 'precio_desde', 'estado']);
        
        if ($request->hasFile('imagen_principal')) {
            $file = $request->file('imagen_principal');
            $fileName = 'proyecto_' . $id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('uploads/lotificaciones', $fileName, 'public');
            $updateData['imagen_principal'] = asset('storage/' . $path);
        }

        DB::table('lotificaciones')->where('id', $id)->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Proyecto actualizado con éxito.'
        ]);
    }
}
