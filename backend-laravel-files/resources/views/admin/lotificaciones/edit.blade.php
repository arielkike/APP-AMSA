<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Editar Proyecto / Lotificación | AMSAsystem</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
    </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen p-4 md:p-8">
    <div class="max-w-4xl mx-auto space-y-6">
        
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
                <span class="text-xs font-bold text-emerald-400 uppercase tracking-wider">Administración de Contenido Móvil</span>
                <h1 class="text-2xl font-black text-white">Editar Proyecto: {{ $lotificacion->nombre }}</h1>
            </div>
            <a href="{{ route('admin.lotificaciones.index') }}" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200">
                ← Volver al Listado
            </a>
        </div>

        @if(session('success'))
            <div class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-bold">
                ✓ {{ session('success') }}
            </div>
        @endif

        <!-- Formulario -->
        <form action="{{ route('admin.lotificaciones.update', $lotificacion->id) }}" method="POST" enctype="multipart/form-data" class="space-y-6">
            @csrf
            @method('PUT')

            <!-- 1. Fotografía Principal -->
            <div class="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 class="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <span>📸 Imagen Principal del Proyecto (Para la App Móvil)</span>
                </h3>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div>
                        <span class="text-xs text-slate-400 block mb-2 font-semibold">Vista Previa Actual:</span>
                        <div class="h-48 rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 relative">
                            <img id="imagePreview" src="{{ $lotificacion->imagen_principal ?? 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80' }}" alt="Preview" class="w-full h-full object-cover">
                        </div>
                    </div>

                    <div class="space-y-3">
                        <label class="text-xs text-slate-300 font-bold block">Seleccionar Nueva Fotografía (JPG, PNG, WebP):</label>
                        <input type="file" name="imagen_principal" id="fileInput" accept="image/*" class="w-full text-xs text-slate-300 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-500 file:text-slate-950 hover:file:bg-emerald-400 cursor-pointer">
                        <p class="text-[11px] text-slate-500">Recomendado: 1200x800 px (Horizontal, alta resolución, máx. 5MB).</p>
                    </div>
                </div>
            </div>

            <!-- 2. Información Comercial y Ubicación -->
            <div class="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 class="text-sm font-bold text-white uppercase tracking-wider">
                    📍 Ubicación y Datos Generales
                </h3>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-1">
                        <label class="text-xs font-bold text-slate-300">Nombre del Proyecto *</label>
                        <input type="text" name="nombre" value="{{ old('nombre', $lotificacion->nombre) }}" required class="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none">
                    </div>

                    <div class="space-y-1">
                        <label class="text-xs font-bold text-slate-300">Precio Desde ($ USD)</label>
                        <input type="number" step="0.01" name="precio_desde" value="{{ old('precio_desde', $lotificacion->precio_desde ?? 8500) }}" class="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none">
                    </div>
                </div>

                <div class="space-y-1">
                    <label class="text-xs font-bold text-slate-300">Dirección / Ubicación Escrita *</label>
                    <input type="text" name="ubicacion" value="{{ old('ubicacion', $lotificacion->ubicacion) }}" required placeholder="Ej: Sébaco, Matagalpa - Km 104 Carretera Panamericana Norte" class="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none">
                </div>

                <div class="space-y-1">
                    <label class="text-xs font-bold text-slate-300">Descripción Comercial</label>
                    <textarea name="descripcion" rows="3" class="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none">{{ old('descripcion', $lotificacion->descripcion) }}</textarea>
                </div>
            </div>

            <!-- Botones -->
            <div class="flex items-center justify-end space-x-3 pt-2">
                <a href="{{ route('admin.lotificaciones.index') }}" class="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300">
                    Cancelar
                </a>
                <button type="submit" class="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
                    Guardar y Actualizar en la App Móvil
                </button>
            </div>
        </form>
    </div>

    <script>
        // Preview inmediato de imagen al seleccionarla
        document.getElementById('fileInput').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    document.getElementById('imagePreview').src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    </script>
</body>
</html>
