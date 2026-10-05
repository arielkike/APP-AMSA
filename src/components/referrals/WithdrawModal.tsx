import React, { useState } from 'react';
import { X, DollarSign, Building2, CreditCard, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../../api/client';
import { SolicitudPago, SolicitudPagoPayload } from '../../types/models';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  disponible: number;
  onSuccess: (solicitud: SolicitudPago) => void;
}

const BANCOS_DISPONIBLES = [
  'BAC Credomatic',
  'Banco LAFISE Bancentro',
  'Banpro Grupo Promerica',
  'BDF (Banco de Finanzas)',
  'Banco Avanz',
];

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  disponible,
  onSuccess,
}) => {
  const [monto, setMonto] = useState<string>(disponible.toString());
  const [banco, setBanco] = useState(BANCOS_DISPONIBLES[0]);
  const [tipoCuenta, setTipoCuenta] = useState<'Ahorro' | 'Corriente'>('Ahorro');
  const [numeroCuenta, setNumeroCuenta] = useState('');
  const [titularCuenta, setTitularCuenta] = useState('');
  const [identificacionTitular, setIdentificacionTitular] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      setErrorMessage('Por favor ingresa un monto válido a retirar.');
      return;
    }

    if (montoNum > disponible) {
      setErrorMessage(`El monto máximo disponible para retirar es de $${disponible.toFixed(2)} USD.`);
      return;
    }

    if (!numeroCuenta.trim()) {
      setErrorMessage('Por favor ingresa el número de cuenta bancaria.');
      return;
    }

    if (!titularCuenta.trim()) {
      setErrorMessage('Por favor ingresa el nombre completo del titular.');
      return;
    }

    if (!identificacionTitular.trim()) {
      setErrorMessage('Por favor ingresa el número de cédula o identificación del titular.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: SolicitudPagoPayload = {
        monto: montoNum,
        banco,
        tipo_cuenta: tipoCuenta,
        numero_cuenta: numeroCuenta.trim(),
        titular_cuenta: titularCuenta.trim(),
        identificacion_titular: identificacionTitular.trim(),
      };

      const res = await api.solicitarRetiro(payload);
      onSuccess(res.solicitud);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al procesar la solicitud de cobro.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-navy-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Solicitar Retiro de Comisión</h3>
              <p className="text-xs text-slate-400">Transferencia bancaria directa en 24-48h</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Banner Saldo Disponible */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-brand-500/10 border border-emerald-500/20 flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                Saldo Disponible
              </span>
              <span className="text-xl font-black text-emerald-400">
                ${disponible.toFixed(2)} <span className="text-xs font-normal text-slate-400">USD</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setMonto(disponible.toString())}
              className="text-xs font-bold text-emerald-300 hover:text-emerald-200 bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-500/30 cursor-pointer"
            >
              Retirar Todo
            </button>
          </div>

          {/* Monto a retirar */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Monto a Retirar (USD) <span className="text-amber-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <DollarSign className="w-4 h-4" />
              </div>
              <input
                type="number"
                step="0.01"
                min="1"
                max={disponible}
                value={monto}
                onKeyDown={(e) => {
                  if (['-', '+', 'e', 'E'].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                onWheel={(e) => (e.target as HTMLElement).blur()}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setMonto(isNaN(v) ? '' : Math.max(0, v).toString());
                }}
                required
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/20 transition-all font-semibold"
              />
            </div>
          </div>

          {/* Banco Destino */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Banco Destino <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Building2 className="w-4 h-4" />
                </div>
                <select
                  value={banco}
                  onChange={(e) => setBanco(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-6 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400 transition-all appearance-none cursor-pointer"
                >
                  {BANCOS_DISPONIBLES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tipo de Cuenta
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTipoCuenta('Ahorro')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    tipoCuenta === 'Ahorro'
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400'
                  }`}
                >
                  Ahorro
                </button>
                <button
                  type="button"
                  onClick={() => setTipoCuenta('Corriente')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    tipoCuenta === 'Corriente'
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400'
                  }`}
                >
                  Corriente
                </button>
              </div>
            </div>
          </div>

          {/* Número de cuenta */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Número de Cuenta Bancaria <span className="text-amber-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <CreditCard className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Ej. 365-992812-4"
                value={numeroCuenta}
                onChange={(e) => setNumeroCuenta(e.target.value)}
                required
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/20 transition-all font-mono"
              />
            </div>
          </div>

          {/* Titular e Identificación */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nombre del Titular <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={titularCuenta}
                  onChange={(e) => setTitularCuenta(e.target.value)}
                  required
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Cédula / Identificación <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej. 441-150885-0002F"
                value={identificacionTitular}
                onChange={(e) => setIdentificacionTitular(e.target.value)}
                required
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-all font-mono"
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Confirmar Retiro
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
