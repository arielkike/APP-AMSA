import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Receipt, Download, CheckCircle, FileText } from 'lucide-react';
import { AbonoRecibo, VentaContrato } from '../../types/models';
import { api } from '../../api/client';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useDocumentExport } from '../../hooks/useDocumentExport';

export const ReceiptsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { exportReciboPDF } = useDocumentExport();

  const idVenta = Number(searchParams.get('id_venta')) || 301;
  const [recibos, setRecibos] = useState<AbonoRecibo[]>([]);
  const [contrato, setContrato] = useState<VentaContrato | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useEffect(() => {
    const loadReceipts = async () => {
      try {
        const [contratos, recibosData] = await Promise.all([
          api.getContratosCliente(),
          api.getRecibosContrato(idVenta),
        ]);
        const current = contratos.find((c) => c.id_venta === idVenta) || contratos[0];
        setContrato(current);
        setRecibos(recibosData);
      } finally {
        setLoading(false);
      }
    };
    loadReceipts();
  }, [idVenta]);

  const handleDownload = async (recibo: AbonoRecibo) => {
    setDownloadingId(recibo.id_abono);
    try {
      await exportReciboPDF(recibo, contrato || undefined);
    } finally {
      setDownloadingId(null);
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
        <h2 className="text-base font-black text-white">Historial de Recibos Oficiales</h2>
        <div className="w-9" />
      </div>

      {contrato && (
        <div className="p-3.5 rounded-2xl bg-navy-900 border border-slate-800 text-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-brand-400 font-bold uppercase">{contrato.lotificacion_nombre}</span>
            <p className="font-bold text-white">{contrato.lote_identificador}</p>
          </div>
          <span className="text-[11px] font-extrabold text-slate-300">
            {recibos.length} Comprobantes
          </span>
        </div>
      )}

      {/* Receipts List */}
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-28 rounded-3xl glass-card animate-shimmer" />
            ))}
          </div>
        ) : recibos.length === 0 ? (
          <div className="p-8 text-center glass-card rounded-3xl space-y-1">
            <Receipt className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-xs text-slate-300 font-bold">Sin recibos registrados aún</p>
            <p className="text-[10px] text-slate-500">Tus pagos aprobados aparecerán aquí.</p>
          </div>
        ) : (
          recibos.map((recibo) => (
            <div
              key={recibo.id_abono}
              className="p-4 rounded-3xl glass-card border border-slate-800 space-y-3 hover:border-brand-500/40 transition-all shadow-glass"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-1.5">
                    <Receipt className="w-4 h-4 text-brand-400" />
                    <span className="font-mono text-xs font-black text-white">{recibo.numero_recibo}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium">{recibo.tipo_pago}</p>
                  <p className="text-[10px] text-slate-400">
                    Fecha: <strong className="text-slate-200">{formatDate(recibo.fecha_pago)}</strong> • {recibo.metodo_pago}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-brand-400 block">
                    {formatCurrency(recibo.monto_abonado)}
                  </span>
                  <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-brand-300">
                    <CheckCircle className="w-3 h-3 text-brand-400" />
                    <span>Aprobado</span>
                  </span>
                </div>
              </div>

              {recibo.referencia && (
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-[10px] text-slate-400 font-mono">
                  Ref: {recibo.referencia} {recibo.cuenta_destino ? `• ${recibo.cuenta_destino}` : ''}
                </div>
              )}

              <button
                disabled={downloadingId === recibo.id_abono}
                onClick={() => handleDownload(recibo)}
                className="w-full py-2.5 px-3 rounded-2xl bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 text-brand-400 text-xs font-bold flex items-center justify-center space-x-2 active:scale-98 transition-all"
              >
                {downloadingId === recibo.id_abono ? (
                  <span>Generando PDF...</span>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Descargar o Compartir PDF</span>
                  </>
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
