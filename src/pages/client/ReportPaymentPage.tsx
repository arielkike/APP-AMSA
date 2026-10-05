import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  CreditCard,
  Send,
  Building2,
  Calendar,
  DollarSign
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VentaContrato, CuentaBancaria, MetodoPago } from '../../types/models';
import { api } from '../../api/client';
import { useCamera } from '../../hooks/useCamera';
import { formatCurrency } from '../../utils/formatters';

export const ReportPaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const { photo, handleInputChange, clearPhoto, isCapturing, error: cameraError } = useCamera();

  const [contratos, setContratos] = useState<VentaContrato[]>([]);
  const [cuentas, setCuentas] = useState<CuentaBancaria[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successReportId, setSuccessReportId] = useState<string | null>(null);

  // Form
  const [selectedVentaId, setSelectedVentaId] = useState<number>(0);
  const [monto, setMonto] = useState<number>(160);
  const [fechaTransferencia, setFechaTransferencia] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('Transferencia Bancaria');
  const [referencia, setReferencia] = useState<string>('');
  const [cuentaDestino, setCuentaDestino] = useState<string>('BAC Credomatic USD (365-894120-1)');
  const [observaciones, setObservaciones] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [contratosData, cuentasData] = await Promise.all([
          api.getContratosCliente(),
          api.getCuentasBancarias(),
        ]);
        setContratos(contratosData);
        setCuentas(cuentasData);
        if (contratosData.length > 0) {
          setSelectedVentaId(contratosData[0].id_venta);
          setMonto(contratosData[0].cuota_mensual || 160);
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleContractChange = (id: number) => {
    setSelectedVentaId(id);
    const selected = contratos.find((c) => c.id_venta === id);
    if (selected) {
      setMonto(selected.cuota_mensual || 160);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referencia && !photo) {
      alert('Por favor ingresa el número de referencia o adjunta la foto del comprobante.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        id_venta: selectedVentaId,
        monto,
        fecha_transferencia: fechaTransferencia,
        metodo_pago: metodoPago,
        referencia,
        cuenta_destino: cuentaDestino,
        observaciones,
        comprobante_base64: photo?.dataUrl,
      };

      const res = await api.reportarPago(payload);
      setSuccessReportId(res.id_tramite || 'TRA-889021');
      confetti({ particleCount: 70, spread: 60 });
    } finally {
      setSubmitting(false);
    }
  };

  if (successReportId) {
    return (
      <div className="p-6 rounded-3xl glass-card text-center space-y-4 animate-fadeIn my-6 border border-brand-500/30">
        <div className="w-16 h-16 rounded-full bg-brand-500/20 text-brand-400 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-1">
          <span className="text-xs font-semibold text-brand-400 uppercase tracking-widest">Reporte Registrado</span>
          <h2 className="text-xl font-black text-white">Comprobante Enviado</h2>
        </div>
        <div className="p-3.5 rounded-2xl bg-navy-900 border border-slate-800 text-xs text-slate-300 space-y-1">
          <p className="text-slate-400">N° de Trámite:</p>
          <p className="text-lg font-mono font-black text-brand-400">{successReportId}</p>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          El cajero de Proyectos San Miguel conciliará el depósito bancario y emitirá tu recibo oficial en el sistema.
        </p>
        <button
          onClick={() => navigate('/cliente/dashboard')}
          className="w-full py-3 rounded-2xl bg-brand-500 text-navy-950 font-black text-xs shadow-card-glow"
        >
          Ir al Panel de Clientes
        </button>
      </div>
    );
  }

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
        <h2 className="text-base font-black text-white">Reportar Abono / Transferencia</h2>
        <div className="w-9" />
      </div>

      <form onSubmit={handleSubmit} className="p-5 rounded-3xl glass-card space-y-4 shadow-glass">
        {/* Contrato Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300">Selecciona el Contrato / Lote</label>
          <select
            value={selectedVentaId}
            onChange={(e) => handleContractChange(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-white text-xs font-semibold focus:outline-none"
          >
            {contratos.map((c) => (
              <option key={c.id_venta} value={c.id_venta} className="bg-navy-900 text-white">
                {c.lotificacion_nombre} - {c.lote_identificador}
              </option>
            ))}
          </select>
        </div>

        {/* Monto & Fecha */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Monto Pagado ($)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="number"
                step="0.01"
                value={monto}
                onChange={(e) => setMonto(Number(e.target.value))}
                className="w-full pl-9 pr-3 py-2 rounded-2xl glass-input text-white text-xs font-bold font-mono focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Fecha del Pago</label>
            <div className="relative">
              <input
                type="date"
                value={fechaTransferencia}
                onChange={(e) => setFechaTransferencia(e.target.value)}
                className="w-full px-3 py-2 rounded-2xl glass-input text-white text-xs font-medium focus:outline-none"
                required
              />
            </div>
          </div>
        </div>

        {/* Método de Pago */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300">Método Utilizado</label>
          <div className="grid grid-cols-2 gap-2">
            {(['Transferencia Bancaria', 'Depósito Bancario'] as MetodoPago[]).map((met) => (
              <button
                type="button"
                key={met}
                onClick={() => setMetodoPago(met)}
                className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all ${
                  metodoPago === met
                    ? 'bg-brand-500 text-navy-950 shadow-card-glow'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {met}
              </button>
            ))}
          </div>
        </div>

        {/* Cuenta Destino */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-300">Cuenta de la Empresa Receptora</label>
          <select
            value={cuentaDestino}
            onChange={(e) => setCuentaDestino(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-white text-xs font-semibold focus:outline-none"
          >
            {cuentas.map((cta) => (
              <option key={cta.id} value={`${cta.banco} ${cta.moneda} (${cta.numero_cuenta})`} className="bg-navy-900 text-white">
                {cta.banco} ({cta.moneda}) - {cta.numero_cuenta}
              </option>
            ))}
          </select>
        </div>

        {/* Referencia */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-300">Número de Referencia / Transacción</label>
          <input
            type="text"
            placeholder="Ej. TRF-9823412"
            value={referencia}
            onChange={(e) => setReferencia(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-white text-xs font-mono focus:outline-none"
          />
        </div>

        {/* Foto Comprobante */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300">Foto del Comprobante / Voucher Bancario</label>
          {photo ? (
            <div className="relative rounded-2xl overflow-hidden border border-brand-500/50 bg-slate-900">
              <img src={photo.dataUrl} alt="Comprobante" className="w-full h-44 object-contain" />
              <button
                type="button"
                onClick={clearPhoto}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white shadow-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <label
                htmlFor="camera-input-reportpayment"
                className="py-3.5 px-3 border-2 border-dashed border-slate-700 hover:border-brand-500 rounded-2xl flex flex-col items-center justify-center space-y-1 text-slate-400 hover:text-brand-400 transition-all bg-navy-900/40 cursor-pointer active:scale-98 text-center"
              >
                <input
                  id="camera-input-reportpayment"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="sr-only"
                  onChange={handleInputChange}
                />
                <Camera className="w-5 h-5 text-brand-400" />
                <span className="text-xs font-bold">Tomar Foto</span>
                <span className="text-[10px] text-slate-500">Cámara</span>
              </label>

              <label
                htmlFor="gallery-input-reportpayment"
                className="py-3.5 px-3 border-2 border-dashed border-slate-700 hover:border-brand-500 rounded-2xl flex flex-col items-center justify-center space-y-1 text-slate-400 hover:text-brand-400 transition-all bg-navy-900/40 cursor-pointer active:scale-98 text-center"
              >
                <input
                  id="gallery-input-reportpayment"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleInputChange}
                />
                <ImageIcon className="w-5 h-5 text-cyan-400" />
                <span className="text-xs font-bold">Galería / Archivo</span>
                <span className="text-[10px] text-slate-500">Elegir imagen</span>
              </label>
            </div>
          )}
          {cameraError && (
            <p className="text-[11px] text-red-400 font-semibold">{cameraError}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 rounded-2xl bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-navy-950 font-black text-xs flex items-center justify-center space-x-2 shadow-card-glow active:scale-98 transition-all"
        >
          {submitting ? (
            <span>Enviando reporte...</span>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Enviar Reporte de Pago</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
