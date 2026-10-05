import React, { useState, useEffect } from 'react';
import { X, UserPlus, Phone, Mail, MapPin, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../api/client';
import { Lotificacion, NuevoReferidoPayload, Referido } from '../../types/models';

interface NewReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (referido: Referido) => void;
}

export const NewReferralModal: React.FC<NewReferralModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [lotificaciones, setLotificaciones] = useState<Lotificacion[]>([]);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [lotificacionId, setLotificacionId] = useState<number | undefined>(undefined);
  const [notas, setNotas] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.getLotificaciones().then((lots) => {
        setLotificaciones(lots);
        if (lots.length > 0 && !lotificacionId) {
          setLotificacionId(lots[0].id);
        }
      });
      setNombre('');
      setTelefono('');
      setEmail('');
      setNotas('');
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!nombre.trim()) {
      setErrorMessage('Por favor ingresa el nombre y apellido del referido.');
      return;
    }

    if (!telefono.trim() || telefono.length < 8) {
      setErrorMessage('Por favor ingresa un número de teléfono o WhatsApp válido.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: NuevoReferidoPayload = {
        nombre_referido: nombre.trim(),
        telefono_referido: telefono.trim(),
        email_referido: email.trim() || undefined,
        lotificacion_id: lotificacionId,
        notas_seguimiento: notas.trim() || undefined,
      };

      const res = await api.registrarReferido(payload);
      onSuccess(res.referido);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al registrar el referido. Intenta nuevamente.');
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
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Registrar Nuevo Referido</h3>
              <p className="text-xs text-slate-400">Gana hasta $100+ USD cuando adquiera su lote</p>
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

          {/* Nombre */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nombre Completo del Contacto <span className="text-amber-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ej. Ing. Roberto Sánchez"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all"
              />
            </div>
          </div>

          {/* Teléfono / WhatsApp */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Teléfono / WhatsApp <span className="text-amber-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                placeholder="Ej. +505 8888-9999"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                required
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Nos comunicaremos cordialmente mencionando tu recomendación.
            </p>
          </div>

          {/* Email (Opcional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Correo Electrónico <span className="text-slate-500 font-normal">(Opcional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                placeholder="contacto@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all"
              />
            </div>
          </div>

          {/* Lotificación de Interés */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Proyecto de Preferencia
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <MapPin className="w-4 h-4" />
              </div>
              <select
                value={lotificacionId || ''}
                onChange={(e) => setLotificacionId(Number(e.target.value) || undefined)}
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-8 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all appearance-none cursor-pointer"
              >
                <option value="">Cualquier Proyecto / Por Definir</option>
                {lotificaciones.map((lot) => (
                  <option key={lot.id} value={lot.id}>
                    {lot.nombre} ({lot.ubicacion.split(',')[0]})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Notas adicionales <span className="text-slate-500 font-normal">(Presupuesto, disponibilidad de visita, etc.)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Ej. Quiere un lote en esquina para construir en diciembre..."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all resize-none"
            />
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
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-navy-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Registrar Referido
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
