import React, { useState, useEffect, useCallback } from 'react';
import { 
  DollarSign, 
  Users, 
  UserPlus, 
  Share2, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  Award, 
  Phone, 
  MapPin, 
  FileText, 
  Search, 
  Sparkles,
  Info,
  Building2,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { 
  Referido, 
  BilleteraReferidosSummary, 
  SolicitudPago, 
  ReferidoEstado 
} from '../../types/models';
import { GuestReferralHero } from '../../components/referrals/GuestReferralHero';
import { NewReferralModal } from '../../components/referrals/NewReferralModal';
import { ShareReferralModal } from '../../components/referrals/ShareReferralModal';
import { WithdrawModal } from '../../components/referrals/WithdrawModal';
import confetti from 'canvas-confetti';

const PIPELINE_STEPS = [
  { key: 'nuevo', label: 'Registrado' },
  { key: 'contactado', label: 'En Contacto' },
  { key: 'visita_agendada', label: 'Visita Lote' },
  { key: 'reservado', label: 'Reservado' },
  { key: 'ganado_comision', label: 'Venta Cerrada' },
];

export const ReferralsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const [summary, setSummary] = useState<BilleteraReferidosSummary | null>(null);
  const [referidos, setReferidos] = useState<Referido[]>([]);
  const [solicitudesPago, setSolicitudesPago] = useState<SolicitudPago[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'referidos' | 'retiros' | 'reglas'>('referidos');
  
  // Filter and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  // Modals
  const [isNewReferralOpen, setIsNewReferralOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const [sum, refs, pagos] = await Promise.all([
        api.getResumenBilletera(),
        api.getMisReferidos(),
        api.getHistorialPagos(),
      ]);
      setSummary(sum);
      setReferidos(refs);
      setSolicitudesPago(pagos);
    } catch (err) {
      console.error('Error cargando referidos:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleReferralSuccess = (nuevo: Referido) => {
    setReferidos((prev) => [nuevo, ...prev]);
    if (summary) {
      setSummary({
        ...summary,
        total_referidos_count: summary.total_referidos_count + 1,
        en_proceso_count: summary.en_proceso_count + 1,
        comisiones_en_proceso: summary.comisiones_en_proceso + 20,
      });
    }
    showToast(`¡${nuevo.nombre_referido} fue registrado! Un asesor de ventas lo contactará.`);
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  const handleWithdrawSuccess = (solicitud: SolicitudPago) => {
    setSolicitudesPago((prev) => [solicitud, ...prev]);
    if (summary) {
      setSummary({
        ...summary,
        disponible_retiro: Math.max(0, summary.disponible_retiro - solicitud.monto),
      });
    }
    showToast(`¡Solicitud de retiro de $${solicitud.monto} enviada con éxito!`);
  };

  // If user is not authenticated, show high-converting Guest Hero
  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <GuestReferralHero />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        <div className="h-8 w-48 bg-slate-800 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="h-28 bg-slate-800/60 rounded-2xl animate-pulse" />
          <div className="h-28 bg-slate-800/60 rounded-2xl animate-pulse" />
          <div className="h-28 bg-slate-800/60 rounded-2xl animate-pulse" />
        </div>
        <div className="h-64 bg-slate-800/40 rounded-2xl animate-pulse" />
      </div>
    );
  }

  const getStepIndex = (estado: ReferidoEstado) => {
    if (estado === 'no_interesado') return -1;
    const idx = PIPELINE_STEPS.findIndex((s) => s.key === estado);
    return idx >= 0 ? idx : 0;
  };

  const filteredReferidos = referidos.filter((ref) => {
    const matchesSearch =
      ref.nombre_referido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ref.telefono_referido.includes(searchTerm) ||
      (ref.lotificacion_nombre || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'todos') return matchesSearch;
    if (statusFilter === 'ganados') return matchesSearch && ref.estado_pipeline === 'ganado_comision';
    if (statusFilter === 'proceso') return matchesSearch && ref.estado_pipeline !== 'ganado_comision' && ref.estado_pipeline !== 'no_interesado';
    if (statusFilter === 'pagados') return matchesSearch && ref.estado_comision === 'pagada';
    return matchesSearch;
  });

  return (
    <div className="max-w-3xl mx-auto px-3.5 sm:px-4 py-5 pb-24 space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-navy-950 font-bold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs sm:text-sm animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Ambassador Tier */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 text-xs font-semibold mb-1">
            <Award className="w-3.5 h-3.5" />
            Nivel Embajador {summary?.nivel_embajador || 'Bronce'}
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Programa de Referidos
          </h1>
          <p className="text-xs text-slate-400">
            Recomienda y gana $20 USD en efectivo por cada lote formalizado.
          </p>
        </div>

        {/* Quick Action Button Header */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-brand-400" />
            <span>Compartir Enlace</span>
          </button>
          <button
            onClick={() => setIsNewReferralOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-navy-950 text-xs font-bold shadow-lg shadow-amber-400/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Referir Contacto</span>
          </button>
        </div>
      </div>

      {/* Wallet Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Ganado */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-brand-950/40 border border-slate-800/80 shadow-xl relative overflow-hidden">
          <div className="absolute top-2 right-2 p-2 rounded-xl bg-brand-500/10 text-brand-400">
            <Award className="w-5 h-5" />
          </div>
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium block mb-1">
            Total Ganado Histórico
          </span>
          <div className="text-2xl font-black text-white">
            ${summary?.total_ganado_historico.toFixed(2) || '0.00'}{' '}
            <span className="text-xs font-normal text-slate-400">USD</span>
          </div>
          <p className="text-[11px] text-brand-400 mt-1 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3 h-3" />
            {summary?.ventas_ganadas_count || 0} ventas concretadas
          </p>
        </div>

        {/* Disponible para Retiro */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/40 border border-emerald-500/30 shadow-xl relative overflow-hidden">
          <div className="absolute top-2 right-2 p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
          <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold block mb-1">
            Disponible para Retiro
          </span>
          <div className="text-2xl font-black text-emerald-300">
            ${summary?.disponible_retiro.toFixed(2) || '0.00'}{' '}
            <span className="text-xs font-normal text-slate-400">USD</span>
          </div>
          <button
            disabled={(summary?.disponible_retiro || 0) <= 0}
            onClick={() => setIsWithdrawOpen(true)}
            className="mt-2 w-full py-1.5 px-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-navy-950 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:cursor-not-allowed"
          >
            <span>Retirar Dinero</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* En Proceso / En Trámite */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-amber-950/30 border border-slate-800/80 shadow-xl relative overflow-hidden">
          <div className="absolute top-2 right-2 p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium block mb-1">
            Comisiones en Trámite
          </span>
          <div className="text-2xl font-black text-amber-300">
            ${summary?.comisiones_en_proceso.toFixed(2) || '0.00'}{' '}
            <span className="text-xs font-normal text-slate-400">USD</span>
          </div>
          <p className="text-[11px] text-amber-400/90 mt-1 flex items-center gap-1 font-semibold">
            <Sparkles className="w-3 h-3" />
            {summary?.en_proceso_count || 0} prospectos activos
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-1 sm:gap-2">
        <button
          onClick={() => setActiveTab('referidos')}
          className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold transition-all relative cursor-pointer ${
            activeTab === 'referidos'
              ? 'text-amber-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            Mis Referidos ({referidos.length})
          </span>
          {activeTab === 'referidos' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('retiros')}
          className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold transition-all relative cursor-pointer ${
            activeTab === 'retiros'
              ? 'text-amber-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <DollarSign className="w-4 h-4" />
            Historial de Retiros ({solicitudesPago.length})
          </span>
          {activeTab === 'retiros' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('reglas')}
          className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold transition-all relative cursor-pointer ${
            activeTab === 'reglas'
              ? 'text-amber-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Info className="w-4 h-4" />
            Reglas del Programa
          </span>
          {activeTab === 'reglas' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
          )}
        </button>
      </div>

      {/* TAB CONTENT 1: MIS REFERIDOS */}
      {activeTab === 'referidos' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nombre, teléfono o proyecto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Status Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'proceso', label: 'En Proceso' },
                { id: 'ganados', label: 'Ganados' },
                { id: 'pagados', label: 'Pagados' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    statusFilter === f.id
                      ? 'bg-amber-400 text-navy-950 font-bold'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* List of Referrals */}
          {filteredReferidos.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">No se encontraron referidos</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {searchTerm || statusFilter !== 'todos'
                  ? 'No hay registros que coincidan con los filtros aplicados.'
                  : 'Aún no has registrado ningún amigo o familiar. ¡Comienza ahora y gana tu primera comisión!'}
              </p>
              <button
                onClick={() => setIsNewReferralOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-navy-950 font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                + Registrar mi primer referido
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReferidos.map((ref) => {
                const currentStepIdx = getStepIndex(ref.estado_pipeline);
                const isWon = ref.estado_pipeline === 'ganado_comision';
                const isPaid = ref.estado_comision === 'pagada';

                return (
                  <div
                    key={ref.id}
                    className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-md space-y-4 hover:border-slate-700 transition-colors"
                  >
                    {/* Top Row: Info & Commission Tag */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm sm:text-base font-bold text-white">
                            {ref.nombre_referido}
                          </h3>
                          {isPaid ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Comisión Pagada
                            </span>
                          ) : isWon ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              Venta Ganada
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-semibold border border-blue-500/30">
                              En Gestión Comercial
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                            {ref.telefono_referido}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            {ref.lotificacion_nombre || 'General'}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Registrado: {ref.fecha_registro}
                          </span>
                        </div>
                      </div>

                      {/* Monto de Comisión */}
                      <div className="text-left sm:text-right bg-slate-800/60 sm:bg-transparent p-2 sm:p-0 rounded-xl">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                          Comisión
                        </span>
                        <span className="text-base sm:text-lg font-black text-amber-400">
                          ${ref.monto_comision.toFixed(2)}{' '}
                          <span className="text-[11px] font-normal text-slate-400">USD</span>
                        </span>
                      </div>
                    </div>

                    {/* Pipeline Visual Stepper */}
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold mb-2">
                        <span>Progreso de la Venta</span>
                        <span className="text-amber-300 font-bold">
                          {isWon ? '¡Venta Cerrada!' : PIPELINE_STEPS[currentStepIdx]?.label || 'Nuevo'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-5 gap-1.5 items-center">
                        {PIPELINE_STEPS.map((step, idx) => {
                          const isCompleted = idx <= currentStepIdx;
                          const isCurrent = idx === currentStepIdx;

                          return (
                            <div key={step.key} className="space-y-1 text-center">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  isCompleted
                                    ? isWon
                                      ? 'bg-amber-400'
                                      : 'bg-brand-500'
                                    : 'bg-slate-800'
                                }`}
                              />
                              <span
                                className={`text-[9px] block truncate ${
                                  isCurrent
                                    ? 'text-white font-bold'
                                    : isCompleted
                                    ? 'text-slate-400'
                                    : 'text-slate-600'
                                }`}
                              >
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Notas de seguimiento del asesor */}
                    {ref.notas_seguimiento && (
                      <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                        <FileText className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-relaxed">
                          {ref.notas_seguimiento}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: HISTORIAL DE RETIROS */}
      {activeTab === 'retiros' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Solicitudes de Cobro</h3>
            <button
              disabled={(summary?.disponible_retiro || 0) <= 0}
              onClick={() => setIsWithdrawOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-navy-950 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
            >
              <span>+ Nuevo Retiro</span>
            </button>
          </div>

          {solicitudesPago.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
              <Building2 className="w-8 h-8 text-slate-500 mx-auto" />
              <h4 className="text-sm font-bold text-white">Sin retiros solicitados</h4>
              <p className="text-xs text-slate-400">
                Cuando acumules comisiones aprobadas podrás solicitar transferencias bancarias desde aquí.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {solicitudesPago.map((sol) => (
                <div
                  key={sol.id}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-white">
                        ${sol.monto.toFixed(2)} USD
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          sol.estado === 'transferido'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : sol.estado === 'en_revision'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        }`}
                      >
                        {sol.estado === 'transferido'
                          ? 'Transferido / Pagado'
                          : sol.estado === 'en_revision'
                          ? 'En Revisión Contable'
                          : 'Solicitado'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 flex items-center gap-2 flex-wrap">
                      <span>{sol.banco} ({sol.tipo_cuenta})</span>
                      <span>•</span>
                      <span className="font-mono">{sol.numero_cuenta}</span>
                      <span>•</span>
                      <span className="text-[11px] text-slate-500">{sol.fecha_solicitud}</span>
                    </div>

                    {sol.numero_referencia_bancaria && (
                      <div className="text-[11px] text-emerald-400 font-mono">
                        Ref. Bancaria: {sol.numero_referencia_bancaria}
                      </div>
                    )}
                  </div>

                  {sol.comprobante_url && (
                    <a
                      href={sol.comprobante_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Ver Voucher</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 3: REGLAS DEL PROGRAMA */}
      {activeTab === 'reglas' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Términos y Condiciones del Programa
            </h3>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
              <li>
                <strong className="text-white">Comisión por Formalización:</strong> Ganarás <span className="text-amber-400 font-bold">$20.00 USD</span> por cada lote o prima formalizada a través de tu código o enlace de referido.
              </li>
              <li>
                <strong className="text-white">Criterio de Validación:</strong> La comisión se activa y acredita en tu billetera en el momento que la administración valida y aprueba el comprobante/voucher de depósito de la prima.
              </li>
              <li>
                <strong className="text-white">Formas de Pago:</strong> Las transferencias se efectúan a cuentas bancarias nacionales (BAC, LAFISE, Banpro, etc.) en un plazo de 24 a 48 horas hábiles tras solicitar tu retiro.
              </li>
              <li>
                <strong className="text-white">Código Personal:</strong> Tu código de referido puede ser utilizado tanto por clientes directos en la app como por promotores externos.
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Modals */}
      <NewReferralModal
        isOpen={isNewReferralOpen}
        onClose={() => setIsNewReferralOpen(false)}
        onSuccess={handleReferralSuccess}
      />

      {summary && (
        <>
          <ShareReferralModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            summary={summary}
          />
          <WithdrawModal
            isOpen={isWithdrawOpen}
            onClose={() => setIsWithdrawOpen(false)}
            disponible={summary.disponible_retiro}
            onSuccess={handleWithdrawSuccess}
          />
        </>
      )}
    </div>
  );
};
