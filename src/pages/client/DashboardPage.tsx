import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Receipt,
  CreditCard,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Layers,
  ChevronRight,
  UploadCloud
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { VentaContrato } from '../../types/models';
import { api } from '../../api/client';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { cliente } = useAuth();
  const [contratos, setContratos] = useState<VentaContrato[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadContracts = async () => {
      try {
        const data = await api.getContratosCliente();
        setContratos(data);
      } finally {
        setLoading(false);
      }
    };
    loadContracts();
  }, []);

  // Consolidate totals
  const totalAbonado = contratos.reduce((sum, c) => sum + (c.total_abonado || 0), 0);
  const totalDeuda = contratos.reduce((sum, c) => sum + (c.saldo_restante || 0), 0);
  const totalPrecio = contratos.reduce((sum, c) => sum + c.precio_final, 0);
  const progresoGlobal = totalPrecio > 0 ? (totalAbonado / totalPrecio) * 100 : 0;

  return (
    <div className="space-y-5 animate-fadeIn pb-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs text-brand-400 font-bold uppercase tracking-wider">Área de Clientes</span>
          <h2 className="text-xl font-black text-white">
            Hola, {cliente?.nombres_apellidos.split(' ')[0] || 'Propietario'} 👋
          </h2>
          <p className="text-[11px] text-slate-400 font-mono">Expediente: {cliente?.expediente_num}</p>
        </div>
      </div>

      {/* Global Financial Portfolio Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-navy-900 via-slate-900 to-navy-950 border border-brand-500/20 shadow-glass space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Total Invertido / Abonado
            </span>
            <div className="text-2xl font-black text-white mt-0.5">
              {formatCurrency(totalAbonado)}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Saldo Restante
            </span>
            <div className="text-lg font-black text-brand-400 mt-0.5">
              {formatCurrency(totalDeuda)}
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-bold">
            <span className="text-slate-300">Progreso Total de Pago</span>
            <span className="text-brand-300">{progresoGlobal.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5">
            <div
              className="bg-gradient-to-r from-brand-500 to-brand-400 h-full rounded-full transition-all duration-1000 shadow-card-glow"
              style={{ width: `${Math.min(100, Math.max(5, progresoGlobal))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Action Button for Payment Report */}
      <button
        onClick={() => navigate('/cliente/reportar-pago')}
        className="w-full p-4 rounded-3xl bg-gradient-to-r from-brand-600 to-brand-500 text-navy-950 flex items-center justify-between shadow-card-glow active:scale-98 transition-transform font-black"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-navy-950/20 flex items-center justify-center">
            <UploadCloud className="w-5 h-5 text-navy-950" />
          </div>
          <div className="text-left">
            <h4 className="text-sm font-black">Reportar Nuevo Abono / Pago</h4>
            <p className="text-[11px] font-medium text-navy-950/80">Sube tu comprobante o transferencia bancaria</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Programa de Referidos & Recompensas Card */}
      <div 
        onClick={() => navigate('/cliente/referidos')}
        className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/15 via-brand-500/10 to-slate-900 border border-amber-500/30 flex items-center justify-between cursor-pointer hover:border-amber-400/50 transition-all shadow-glass group active:scale-98"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-lg group-hover:scale-105 transition-transform">
            🎁
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-black text-white">Programa de Referidos</h4>
              <span className="px-1.5 py-0.2 rounded bg-amber-400 text-navy-950 text-[9px] font-black uppercase">
                Gana $20 USD
              </span>
            </div>
            <p className="text-[11px] text-slate-300">Recomienda y cobra $20 USD por lote formalizado</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform" />
      </div>

      {/* Mis Contratos / Terrenos */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
          <Layers className="w-3.5 h-3.5 text-brand-400" />
          <span>Mis Lotes y Contratos ({contratos.length})</span>
        </h3>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((n) => (
              <div key={n} className="h-44 rounded-3xl glass-card animate-shimmer" />
            ))}
          </div>
        ) : contratos.length === 0 ? (
          <div className="p-8 text-center glass-card rounded-3xl">
            <p className="text-xs text-slate-400">No se encontraron contratos vigentes asociados a tu expediente.</p>
          </div>
        ) : (
          contratos.map((contrato) => {
            const contratProgreso =
              contrato.precio_final > 0
                ? ((contrato.total_abonado || 0) / contrato.precio_final) * 100
                : 0;

            const isEnMora = contrato.estado_pago === 'En Mora' || (contrato.dias_mora && contrato.dias_mora > 0);

            return (
              <div
                key={contrato.id_venta}
                className="p-4 rounded-3xl glass-card border border-slate-800 space-y-3.5 hover:border-brand-500/40 transition-all shadow-glass"
              >
                {/* Header Contract */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-brand-400 uppercase">
                      {contrato.lotificacion_nombre || 'Lotificación La Campana'}
                    </span>
                    <h4 className="text-base font-black text-white">
                      {contrato.lote_identificador || `Contrato #${contrato.id_venta}`}
                    </h4>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center space-x-1 ${
                      isEnMora
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                    }`}
                  >
                    {isEnMora ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                    <span>{isEnMora ? 'En Mora' : 'Al Día'}</span>
                  </span>
                </div>

                {/* Progress bar per contract */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>
                      Abonado: <strong className="text-white">{formatCurrency(contrato.total_abonado)}</strong>
                    </span>
                    <span>
                      Saldo: <strong className="text-brand-400">{formatCurrency(contrato.saldo_restante)}</strong>
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-brand-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, Math.max(5, contratProgreso))}%` }}
                    />
                  </div>
                </div>

                {/* Next Payment Info */}
                <div className="p-3 rounded-2xl bg-navy-900/80 border border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block">Próximo Vencimiento</span>
                      <span className="font-bold text-white">
                        {formatDate(contrato.proxima_cuota_vencimiento || '2026-10-15')}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Valor Cuota</span>
                    <span className="font-black text-sm text-brand-400">
                      {formatCurrency(contrato.proxima_cuota_monto || contrato.cuota_mensual)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => navigate(`/cliente/estado-cuenta?id_venta=${contrato.id_venta}`)}
                    className="py-2.5 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center space-x-1.5 active:scale-98 transition-all"
                  >
                    <FileText className="w-3.5 h-3.5 text-brand-400" />
                    <span>Estado de Cuenta</span>
                  </button>

                  <button
                    onClick={() => navigate(`/cliente/recibos?id_venta=${contrato.id_venta}`)}
                    className="py-2.5 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center space-x-1.5 active:scale-98 transition-all"
                  >
                    <Receipt className="w-3.5 h-3.5 text-amber-400" />
                    <span>Mis Recibos</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
