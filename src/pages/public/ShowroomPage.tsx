import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Sparkles, ChevronRight, Search, Layers } from 'lucide-react';
import { Lotificacion } from '../../types/models';
import { api } from '../../api/client';
import { formatCurrency } from '../../utils/formatters';

export const ShowroomPage: React.FC = () => {
  const navigate = useNavigate();
  const [lotificaciones, setLotificaciones] = useState<Lotificacion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await api.getLotificaciones();
        setLotificaciones(data);
      } finally {
        setLoading(false);
      }
    };
    loadProjects();
  }, []);

  const filtered = lotificaciones.filter((item) =>
    item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.ubicacion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-900 via-navy-900 to-navy-950 p-5 border border-brand-500/20 shadow-glass">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-36 h-36 rounded-full bg-brand-500/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Terrenos y Urbanizaciones</span>
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            Invierte en tu futuro con Proyectos San Miguel
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Financiamiento directo, sin intermediarios bancarios, hasta 72 meses y entrega inmediata.
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por proyecto o ubicación..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-2xl glass-input text-sm text-white placeholder-slate-400 focus:outline-none transition-all"
        />
      </div>

      {/* Referral Program Banner */}
      <div 
        onClick={() => navigate('/referidos')}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/20 via-brand-500/15 to-slate-900 border border-amber-500/30 p-3.5 flex items-center justify-between cursor-pointer hover:border-amber-400/50 transition-all shadow-lg active:scale-[0.99] group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/30 text-amber-300 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
            🎁
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white">Programa de Referidos</span>
              <span className="px-1.5 py-0.2 rounded bg-amber-400 text-navy-950 text-[9px] font-black uppercase">
                Gana $20 USD
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Recomienda a un amigo y gana $20 por cada lote formalizado.
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-amber-400 shrink-0 group-hover:translate-x-1 transition-transform" />
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/simulador')}
          className="p-3.5 rounded-2xl glass-card text-left space-y-1 hover:border-brand-500/40 transition-all group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center text-sm font-bold group-hover:scale-105 transition-transform">
            ⚡
          </div>
          <p className="text-xs font-bold text-white">Simulador Rápido</p>
          <p className="text-[10px] text-slate-400">Calcula tu cuota mensual</p>
        </button>

        <button
          onClick={() => navigate('/pre-reserva')}
          className="p-3.5 rounded-2xl glass-card text-left space-y-1 hover:border-brand-500/40 transition-all group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm font-bold group-hover:scale-105 transition-transform">
            📝
          </div>
          <p className="text-xs font-bold text-white">Apartar Lote</p>
          <p className="text-[10px] text-slate-400">Pre-reserva digital en 3 pasos</p>
        </button>
      </div>

      {/* Project List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
            <Layers className="w-4 h-4 text-brand-400" />
            <span>Proyectos Disponibles ({filtered.length})</span>
          </h3>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-56 rounded-3xl glass-card animate-shimmer" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center glass-card rounded-3xl space-y-2">
            <p className="text-sm font-semibold text-slate-300">No se encontraron proyectos</p>
            <p className="text-xs text-slate-500">Prueba ajustando los términos de búsqueda</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/proyectos/${item.id}`)}
              className="overflow-hidden rounded-3xl glass-card hover:border-brand-500/40 transition-all cursor-pointer group shadow-glass"
            >
              {/* Image Preview */}
              <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                <img
                  src={item.imagen_principal || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'}
                  alt={item.nombre}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent" />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex space-x-1.5">
                  <span className="px-2.5 py-1 rounded-full bg-brand-500 text-navy-950 text-[10px] font-extrabold uppercase tracking-wide">
                    {item.lotes_disponibles || 20} Lotes Disponibles
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-white leading-snug drop-shadow-md">
                      {item.nombre}
                    </h4>
                    <p className="text-xs text-slate-300 flex items-center space-x-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                      <span className="truncate max-w-[200px]">{item.ubicacion}</span>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Desde</span>
                    <span className="text-base font-extrabold text-brand-400">
                      {formatCurrency(item.precio_desde || 8500)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Amenidades Tags & Action */}
              <div className="p-3.5 space-y-2.5 bg-navy-900/60">
                {item.amenidades && item.amenidades.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {item.amenidades.slice(0, 3).map((amenity, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg bg-slate-800/80 text-[10px] font-medium text-slate-300 border border-slate-700/50"
                      >
                        ✓ {amenity}
                      </span>
                    ))}
                    {item.amenidades.length > 3 && (
                      <span className="px-2 py-0.5 rounded-lg bg-slate-800/80 text-[10px] font-medium text-slate-400">
                        +{item.amenidades.length - 3} más
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-xs font-semibold text-brand-400 group-hover:text-brand-300">
                  <span>Explorar Bloques y Lotes</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
