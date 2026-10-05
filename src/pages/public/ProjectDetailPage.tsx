import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  ArrowLeft,
  Navigation,
  Sparkles,
  Calculator,
  BookmarkCheck,
  Filter,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Lotificacion, Lote, LoteEstado } from '../../types/models';
import { api } from '../../api/client';
import { formatCurrency } from '../../utils/formatters';
import { metrosToVaras } from '../../utils/conversions';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Lotificacion | null>(null);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedBlock, setSelectedBlock] = useState<string>('all');
  const [selectedLoteModal, setSelectedLoteModal] = useState<Lote | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        const projects = await api.getLotificaciones();
        const current = projects.find((p) => p.id === Number(id)) || projects[0];
        setProject(current);

        const lotsData = await api.getLotesByLotificacion(Number(id));
        // Ocultar lotes vendidos: solo mostrar Disponibles y Reservados
        const filteredPublicLots = lotsData.filter((l) => l.estado !== 'Vendido');
        setLotes(filteredPublicLots);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const openInMaps = () => {
    if (project?.coordenadas) {
      const { lat, lng } = project.coordenadas;
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_system');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(project?.ubicacion || '')}`, '_system');
    }
  };

  const blocks = Array.from(new Set(lotes.map((l) => l.nombre_bloque || 'Bloque General')));

  const filteredLotes = lotes.filter((lote) => {
    const matchesStatus = selectedStatus === 'all' || lote.estado === selectedStatus;
    const matchesBlock = selectedBlock === 'all' || (lote.nombre_bloque || 'Bloque General') === selectedBlock;
    return matchesStatus && matchesBlock;
  });

  const getStatusBadge = (estado: LoteEstado) => {
    switch (estado) {
      case 'Disponible':
        return (
          <span className="px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30 text-[10px] font-bold flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Disponible</span>
          </span>
        );
      case 'Reservado':
        return (
          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Reservado</span>
          </span>
        );
      default:
        return null;
    }
  };

  if (loading || !project) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-64 rounded-3xl glass-card animate-shimmer" />
        <div className="h-32 rounded-2xl glass-card animate-shimmer" />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-6">
      {/* Header Image & Back Button */}
      <div className="relative -mx-4 -mt-3 h-64 overflow-hidden bg-slate-900">
        <img
          src={project.imagen_principal || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'}
          alt={project.nombre}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/50 to-transparent" />

        <button
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 p-2.5 rounded-2xl bg-navy-950/70 backdrop-blur-md text-white border border-white/10 active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md bg-brand-500 text-navy-950 text-[10px] font-extrabold uppercase tracking-wide mb-1.5">
            Proyecto Oficial AMSA
          </div>
          <h2 className="text-2xl font-black text-white">{project.nombre}</h2>
          <p className="text-xs text-slate-300 flex items-center space-x-1 mt-1">
            <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
            <span className="truncate">{project.ubicacion}</span>
          </p>
        </div>
      </div>

      {/* Description & Navigation Button */}
      <div className="p-4 rounded-3xl glass-card space-y-3">
        <p className="text-xs text-slate-300 leading-relaxed">
          {project.descripcion || 'Urbanización de alta plusvalía con financiamiento directo disponible.'}
        </p>

        <button
          onClick={openInMaps}
          className="w-full py-2.5 px-4 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-brand-500/50 text-brand-400 text-xs font-bold flex items-center justify-center space-x-2 active:scale-98 transition-all"
        >
          <Navigation className="w-4 h-4 text-brand-400" />
          <span>Cómo Llegar (Google Maps / Waze)</span>
        </button>
      </div>

      {/* Amenidades */}
      {project.amenidades && project.amenidades.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Amenidades y Servicios</span>
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {project.amenidades.map((amenity, i) => (
              <div
                key={i}
                className="p-2.5 rounded-2xl glass-card flex items-center space-x-2 text-xs text-slate-200"
              >
                <div className="w-2 h-2 rounded-full bg-brand-400" />
                <span className="truncate">{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lotes Inventory & Filters */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-white flex items-center space-x-1.5">
            <Filter className="w-4 h-4 text-brand-400" />
            <span>Inventario Activo ({filteredLotes.length} Disponibles / Reservados)</span>
          </h3>
        </div>

        {/* Filter Pills (Solo Disponibles y Reservados) */}
        <div className="flex space-x-2 overflow-x-auto pb-1 no-scrollbar">
          {['all', 'Disponible', 'Reservado'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedStatus === status
                  ? 'bg-brand-500 text-navy-950 shadow-card-glow'
                  : 'bg-slate-800/80 text-slate-400 border border-slate-700/60'
              }`}
            >
              {status === 'all' ? 'Ver Todos' : status}
            </button>
          ))}
        </div>

        {/* Block Selector */}
        {blocks.length > 1 && (
          <div className="flex space-x-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedBlock('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap ${
                selectedBlock === 'all'
                  ? 'bg-slate-700 text-white border border-slate-500'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800'
              }`}
            >
              Todos los bloques
            </button>
            {blocks.map((block) => (
              <button
                key={block}
                onClick={() => setSelectedBlock(block)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap ${
                  selectedBlock === block
                    ? 'bg-slate-700 text-white border border-slate-500'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800'
                }`}
              >
                Bloque {block}
              </button>
            ))}
          </div>
        )}

        {/* Lotes Grid */}
        <div className="grid grid-cols-1 gap-3">
          {filteredLotes.map((lote) => {
            const varas = lote.area_varas || metrosToVaras(lote.area_metros);
            const isAvailable = lote.estado === 'Disponible';

            return (
              <div
                key={lote.id_lote}
                onClick={() => setSelectedLoteModal(lote)}
                className={`p-4 rounded-3xl glass-card border transition-all cursor-pointer ${
                  isAvailable
                    ? 'border-brand-500/20 hover:border-brand-500/60 shadow-glass'
                    : 'border-amber-500/30 bg-amber-500/5'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-base font-black text-white">
                        Lote {lote.numero_lote}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        (Bloque {lote.nombre_bloque})
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 font-medium">
                      {lote.area_metros.toFixed(2)} m² / <span className="text-brand-300 font-semibold">{varas.toFixed(2)} vrs²</span>
                    </p>
                  </div>
                  {getStatusBadge(lote.estado)}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Precio Contado/Lista</span>
                    <span className="text-sm font-extrabold text-brand-400">
                      {formatCurrency(lote.precio_base)}
                    </span>
                  </div>

                  {isAvailable && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/simulador?precio=${lote.precio_base}&lote=${lote.numero_lote}&id=${lote.id_lote}`);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1"
                      >
                        <Calculator className="w-3.5 h-3.5 text-brand-400" />
                        <span>Simular</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/pre-reserva?lote_id=${lote.id_lote}&project_id=${project.id}&precio=${lote.precio_base}`);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-brand-500 text-navy-950 text-xs font-extrabold flex items-center space-x-1 shadow-card-glow"
                      >
                        <BookmarkCheck className="w-3.5 h-3.5" />
                        <span>Apartar</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lot Detail Bottom Modal */}
      {selectedLoteModal && (
        <div
          className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-md flex items-end justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedLoteModal(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl glass-panel p-5 space-y-4 border border-slate-700 shadow-glass"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-brand-400 uppercase">{project.nombre}</span>
                <h3 className="text-xl font-black text-white">
                  Lote {selectedLoteModal.numero_lote} (Bloque {selectedLoteModal.nombre_bloque})
                </h3>
              </div>
              {getStatusBadge(selectedLoteModal.estado)}
            </div>

            <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-navy-900/80 border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block">Área en Metros:</span>
                <span className="font-bold text-white text-sm">{selectedLoteModal.area_metros.toFixed(2)} m²</span>
              </div>
              <div>
                <span className="text-slate-400 block">Área en Varas:</span>
                <span className="font-bold text-brand-300 text-sm">
                  {(selectedLoteModal.area_varas || metrosToVaras(selectedLoteModal.area_metros)).toFixed(2)} vrs²
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Precio Total:</span>
                <span className="font-bold text-brand-400 text-sm">{formatCurrency(selectedLoteModal.precio_base)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Prima Mínima (10%):</span>
                <span className="font-bold text-amber-300 text-sm">{formatCurrency(selectedLoteModal.precio_base * 0.10)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  const lote = selectedLoteModal;
                  setSelectedLoteModal(null);
                  navigate(`/simulador?precio=${lote.precio_base}&lote=${lote.numero_lote}&id=${lote.id_lote}`);
                }}
                className="py-3 rounded-2xl bg-slate-800 text-slate-200 text-xs font-bold flex items-center justify-center space-x-1.5 hover:bg-slate-700"
              >
                <Calculator className="w-4 h-4 text-brand-400" />
                <span>Simular Cuotas</span>
              </button>

              {selectedLoteModal.estado === 'Disponible' ? (
                <button
                  onClick={() => {
                    const lote = selectedLoteModal;
                    setSelectedLoteModal(null);
                    navigate(`/pre-reserva?lote_id=${lote.id_lote}&project_id=${project.id}&precio=${lote.precio_base}`);
                  }}
                  className="py-3 rounded-2xl bg-brand-500 text-navy-950 text-xs font-black flex items-center justify-center space-x-1.5 shadow-card-glow"
                >
                  <BookmarkCheck className="w-4 h-4" />
                  <span>Apartar Ahora</span>
                </button>
              ) : (
                <button
                  onClick={() => setSelectedLoteModal(null)}
                  className="py-3 rounded-2xl bg-slate-800 text-slate-400 text-xs font-bold"
                >
                  Cerrar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
