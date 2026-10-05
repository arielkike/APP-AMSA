import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, CheckCircle2, Clock, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { Cuota, VentaContrato } from '../../types/models';
import { api } from '../../api/client';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useDocumentExport } from '../../hooks/useDocumentExport';

export const AccountStatementPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { exportEstadoCuentaPDF } = useDocumentExport();

  const idVenta = Number(searchParams.get('id_venta')) || 301;
  const [contrato, setContrato] = useState<VentaContrato | null>(null);
  const [cuotas, setCuotas] = useState<Cuota[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadAccount = async () => {
      try {
        const [contratos, cuotasData] = await Promise.all([
          api.getContratosCliente(),
          api.getCuotasContrato(idVenta),
        ]);
        const current = contratos.find((c) => c.id_venta === idVenta) || contratos[0];
        setContrato(current);
        setCuotas(cuotasData);
      } finally {
        setLoading(false);
      }
    };
    loadAccount();
  }, [idVenta]);

  const pagadasCount = cuotas.filter((c) => c.estado === 'Pagada').length;
  const pendientesCount = cuotas.filter((c) => c.estado === 'Pendiente').length;
  const moraCount = cuotas.filter((c) => c.estado === 'Mora').length;

  const filteredCuotas = cuotas.filter((c) => {
    if (filterStatus === 'all') return true;
    return c.estado === filterStatus;
  });

  const handleDownloadPDF = () => {
    if (contrato) {
      exportEstadoCuentaPDF(contrato, cuotas);
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/cliente/dashboard')}
          className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-base font-black text-white">Estado de Cuenta</h2>
        <button
          onClick={handleDownloadPDF}
          className="p-2 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30 hover:bg-brand-500/30"
          title="Exportar PDF"
        >
          <Download className="w-5 h-5" />
        </button>
      </div>

      {/* Contract summary pill */}
      {contrato && (
        <div className="p-4 rounded-3xl glass-card space-y-3 border border-brand-500/20">
          <div>
            <span className="text-[10px] text-brand-400 font-bold uppercase">
              {contrato.lotificacion_nombre}
            </span>
            <h3 className="text-lg font-black text-white">{contrato.lote_identificador}</h3>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-800">
            <div className="p-2 rounded-2xl bg-brand-500/10">
              <span className="text-[10px] text-brand-300 block font-bold">Pagadas</span>
              <span className="text-sm font-black text-white">{pagadasCount}</span>
            </div>
            <div className="p-2 rounded-2xl bg-slate-800/60">
              <span className="text-[10px] text-slate-400 block font-bold">Pendientes</span>
              <span className="text-sm font-black text-white">{pendientesCount}</span>
            </div>
            <div className="p-2 rounded-2xl bg-red-500/10">
              <span className="text-[10px] text-red-300 block font-bold">En Mora</span>
              <span className="text-sm font-black text-red-400">{moraCount}</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex space-x-2">
        {['all', 'Pagada', 'Pendiente', 'Mora'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              filterStatus === st
                ? 'bg-brand-500 text-navy-950 shadow-card-glow'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            {st === 'all' ? 'Todas' : st}
          </button>
        ))}
      </div>

      {/* Quotas List */}
      <div className="space-y-2.5">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-16 rounded-2xl glass-card animate-shimmer" />
            ))}
          </div>
        ) : filteredCuotas.length === 0 ? (
          <div className="p-6 text-center glass-card rounded-2xl">
            <p className="text-xs text-slate-400">No hay cuotas con este estado.</p>
          </div>
        ) : (
          filteredCuotas.map((cuota) => {
            const isPaid = cuota.estado === 'Pagada';
            const isMora = cuota.estado === 'Mora';

            return (
              <div
                key={cuota.id_cuota}
                className="p-3.5 rounded-2xl glass-card border border-slate-800/80 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isPaid
                        ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                        : isMora
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    #{cuota.numero_cuota}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Vence: {formatDate(cuota.fecha_vencimiento)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Saldo restante: {formatCurrency(cuota.saldo_restante)}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-white block">
                    {formatCurrency(cuota.monto_total)}
                  </span>
                  <span
                    className={`text-[10px] font-bold ${
                      isPaid ? 'text-brand-400' : isMora ? 'text-red-400' : 'text-slate-400'
                    }`}
                  >
                    {cuota.estado}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
