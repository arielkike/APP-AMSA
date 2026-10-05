<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Proyectos y Contenido Móvil | AMSAsystem</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
    </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen p-4 md:p-8">
    <div class="max-w-5xl mx-auto space-y-6">
        
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
                <span class="text-xs font-bold text-emerald-400 uppercase tracking-wider">Módulo de Administración Web</span>
                <h1 class="text-2xl font-black text-white">Gestión de Proyectos y App Móvil</h1>
                <p class="text-xs text-slate-400">Actualiza las fotografías, descripciones y ubicaciones que se muestran en tiempo real en los teléfonos.</p>
            </div>
        </div>

        @if(session('success'))
            <div class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-bold">
                ✓ {{ session('success') }}
            </div>
        @endif

        <!-- Grid de Proyectos -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @foreach($lotificaciones as $proj)
            <div class="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 hover:border-emerald-500/40 transition-all flex flex-col justify-between">
                <div class="space-y-3">
                    <div class="h-40 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 relative">
                        <img src="{{ $proj->imagen_principal ?? 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80' }}" alt="{{ $proj->nombre }}" class="w-full h-full object-cover">
                        <span class="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                            {{ $proj->estado ?? 'Activo' }}
                        </span>
                    </div>

                    <div>
                        <h3 class="text-lg font-bold text-white">{{ $proj->nombre }}</h3>
                        <p class="text-xs text-slate-400 flex items-center space-x-1 mt-0.5">
                            <span>📍 {{ $proj->ubicacion }}</span>
                        </p>
                    </div>

                    <p class="text-xs text-slate-300 line-clamp-2">
                        {{ $proj->descripcion ?? 'Sin descripción comercial asignada.' }}
                    </p>
                </div>

                <div class="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div>
                        <span class="text-[10px] text-slate-500 uppercase font-semibold block">Precio Base</span>
                        <span class="text-sm font-extrabold text-emerald-400">${{ number_format($proj->precio_desde ?? 8500, 2) }}</span>
                    </div>

                    <a href="{{ route('admin.lotificaciones.edit', $proj->id) }}" class="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all">
                        📸 Cambiar Foto y Datos
                    </a>
                </div>
            </div>
            @endforeach
        </div>
    </div>
</body>
</html>
