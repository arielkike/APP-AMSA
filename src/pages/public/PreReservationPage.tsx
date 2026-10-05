import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  BookmarkCheck,
  Building2,
  Camera,
  CheckCircle2,
  User,
  CreditCard,
  ArrowRight,
  ShieldCheck,
  Trash2,
  Gift,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Lotificacion, Lote, CuentaBancaria } from '../../types/models';
import { api } from '../../api/client';
import { formatCurrency, formatCedula } from '../../utils/formatters';
import { useCamera } from '../../hooks/useCamera';
import { StorageService } from '../../utils/storage';

export const PreReservationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { photo, takePhoto, clearPhoto, isCapturing } = useCamera();

  const [step, setStep] = useState<number>(1);
  const [lotificaciones, setLotificaciones] = useState<Lotificacion[]>([]);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [cuentasBancarias, setCuentasBancarias] = useState<CuentaBancaria[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successCode, setSuccessCode] = useState<string | null>(null);

  // Form State
  const [selectedProjectId, setSelectedProjectId] = useState<number>(
    Number(searchParams.get('project_id')) || 1
  );
  const [selectedLoteId, setSelectedLoteId] = useState<number>(
    Number(searchParams.get('lote_id')) || 0
  );
  const [nombres, setNombres] = useState<string>('');
  const [identificacion, setIdentificacion] = useState<string>('');
  const [telefono, setTelefono] = useState<string>('');
  const [direccion, setDireccion] = useState<string>('');
  const [selectedCuentaId, setSelectedCuentaId] = useState<number>(1);
  const [montoAnticipo, setMontoAnticipo] = useState<number>(100);
  const [numReferencia, setNumReferencia] = useState<string>('');
  const [codigoReferido, setCodigoReferido] = useState<string>('');
  const [step3Error, setStep3Error] = useState<string | null>(null);

  useEffect(() => {
    const initData = async () => {
      try {
        setLoadingData(true);
        const [projs, cuentas, storedRefCode] = await Promise.all([
          api.getLotificaciones(),
          api.getCuentasBancarias(),
          StorageService.get('referral_code')
        ]);
        setLotificaciones(projs);
        setCuentasBancarias(cuentas);
        if (cuentas.length > 0) {
          setSelectedCuentaId(cuentas[0].id);
        }

        const urlRef = searchParams.get('ref') || searchParams.get('referido') || searchParams.get('promotor');
        if (urlRef) {
          setCodigoReferido(urlRef.trim().toUpperCase());
          StorageService.set('referral_code', urlRef.trim().toUpperCase());
        } else if (storedRefCode) {
          setCodigoReferido(storedRefCode.trim().toUpperCase());
        }

        const currentProjId = Number(searchParams.get('project_id')) || (projs.length > 0 ? projs[0].id : 1);
        setSelectedProjectId(currentProjId);

        const lots = await api.getLotesByLotificacion(currentProjId);
        const available = lots.filter(l => l.estado === 'Disponible');
        setLotes(available);

        const targetLoteId = Number(searchParams.get('lote_id'));
        if (targetLoteId && available.some(l => l.id_lote === targetLoteId)) {
          setSelectedLoteId(targetLoteId);
        } else if (available.length > 0) {
          setSelectedLoteId(available[0].id_lote);
        } else {
          setSelectedLoteId(0);
        }
      } catch (err) {
        console.error('Error initializing formalizacion:', err);
      } finally {
        setLoadingData(false);
      }
    };
    initData();
  }, [searchParams]);

  const handleProjectChange = async (projectId: number) => {
    setSelectedProjectId(projectId);
    const lots = await api.getLotesByLotificacion(projectId);
    const available = lots.filter(l => l.estado === 'Disponible');
    setLotes(available);
    if (available.length > 0) {
      setSelectedLoteId(available[0].id_lote);
    } else {
      setSelectedLoteId(0);
    }
  };

  const selectedLote = lotes.find(l => l.id_lote === selectedLoteId);

  const handleSubmitReservation = async () => {
    setStep3Error(null);

    if (!montoAnticipo || montoAnticipo <= 0) {
      setStep3Error('Por favor ingresa un monto de anticipo válido mayor a $0 USD.');
      return;
    }

    if (!photo?.dataUrl) {
      setStep3Error('Por favor toma una foto o sube la imagen del comprobante/voucher bancario.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        id_lote: selectedLoteId,
        lotificacion_id: selectedProjectId,
        nombres_apellidos: nombres,
        identificacion,
        telefono,
        direccion,
        cuenta_bancaria_id: selectedCuentaId,
        monto_anticipo: montoAnticipo,
        referencia_bancaria: numReferencia,
        comprobante_voucher: photo?.dataUrl || '',
        codigo_referido: codigoReferido.trim() || undefined
      };

      const res = await api.registrarFormalizacion(payload);
      setSuccessCode(res.codigo_reserva || 'FOR-2026-7789');
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      setStep3Error(err.message || 'Error al enviar la formalización. Intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <div className="py-16 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
        <p className="text-xs text-slate-400 font-semibold">Cargando proyectos y lotes disponibles...</p>
      </div>
    );
  }

  if (successCode) {
    return (
      <div className="p-6 rounded-3xl glass-card text-center space-y-4 animate-fadeIn my-6 border border-brand-500/30">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-1">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Formalización Registrada</span>
          <h2 className="text-2xl font-black text-white">¡Prima / Lote Formalizado!</h2>
        </div>
        <div className="p-3.5 rounded-2xl bg-navy-900 border border-slate-800 text-xs text-slate-300 space-y-1">
          <p className="text-slate-400">Código de Trámite:</p>
          <p className="text-lg font-mono font-black text-brand-400">{successCode}</p>
        </div>
        {codigoReferido && (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-center gap-2">
            <Gift className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Código de referido vinculado: <strong className="font-mono">{codigoReferido}</strong> (Comisión de $20 en proceso de aprobación).</span>
          </div>
        )}
        <p className="text-xs text-slate-300 leading-relaxed">
          La administración revisará tu voucher de depósito y validará la formalización de tu terreno. Nos pondremos en contacto vía WhatsApp ({telefono}) para la firma oficial.
        </p>
        <button
          onClick={() => navigate('/')}
          className="w-full py-3 rounded-2xl bg-brand-500 text-navy-950 font-black text-xs shadow-card-glow cursor-pointer"
        >
          Volver al Catálogo
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fadeIn pb-6">
      {/* Step Indicators */}
      <div className="flex items-center justify-between px-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center space-x-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                step === s
                  ? 'bg-brand-500 text-navy-950 shadow-card-glow'
                  : step > s
                  ? 'bg-brand-500/30 text-brand-400'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              {s}
            </div>
            <span className={`text-[11px] font-bold ${step === s ? 'text-white' : 'text-slate-500'}`}>
              {s === 1 ? 'Lote' : s === 2 ? 'Comprador' : 'Voucher'}
            </span>
          </div>
        ))}
      </div>

      {/* STEP 1: Selección de Lote */}
      {step === 1 && (
        <div className="p-4 rounded-3xl glass-card space-y-4">
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-white flex items-center space-x-1.5">
              <Building2 className="w-4 h-4 text-brand-400" />
              <span>Paso 1: Selecciona el Terreno</span>
            </h3>
            <p className="text-xs text-slate-400">Elige la lotificación y el lote que deseas apartar.</p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Proyecto Inmobiliario</label>
              <select
                value={selectedProjectId}
                onChange={(e) => handleProjectChange(Number(e.target.value))}
                className="w-full px-3.5 py-3 rounded-2xl bg-slate-800/90 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-brand-400 cursor-pointer"
              >
                {lotificaciones.map((proj) => (
                  <option key={proj.id} value={proj.id} className="bg-slate-900 text-white py-1">
                    {proj.nombre} - ({proj.ubicacion.split(',')[0]})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Lote Disponible</label>
              {lotes.length === 0 ? (
                <p className="text-xs text-amber-400 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  No hay lotes disponibles en este momento para este proyecto.
                </p>
              ) : (
                <select
                  value={selectedLoteId}
                  onChange={(e) => setSelectedLoteId(Number(e.target.value))}
                  className="w-full px-3.5 py-3 rounded-2xl bg-slate-800/90 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-brand-400 cursor-pointer"
                >
                  {lotes.map((l) => (
                    <option key={l.id_lote} value={l.id_lote} className="bg-slate-900 text-white py-1">
                      Lote {l.numero_lote} ({l.nombre_bloque}) - {l.area_metros} m² - {formatCurrency(l.precio_base)}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {selectedLote && (
              <div className="p-3 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-xs space-y-1">
                <span className="text-[10px] text-brand-300 font-extrabold uppercase">Resumen del Lote</span>
                <div className="flex justify-between font-bold text-white">
                  <span>Lote {selectedLote.numero_lote} ({selectedLote.nombre_bloque})</span>
                  <span className="text-brand-400">{formatCurrency(selectedLote.precio_base)}</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Área: {selectedLote.area_metros} m² ({((selectedLote.area_varas || selectedLote.area_metros * 1.418415)).toFixed(2)} vrs²)
                </p>
              </div>
            )}
          </div>

          <button
            disabled={!selectedLoteId || lotes.length === 0}
            onClick={() => setStep(2)}
            className="w-full py-3 rounded-2xl bg-brand-500 disabled:opacity-50 hover:bg-brand-400 text-navy-950 font-black text-xs flex items-center justify-center space-x-1.5 shadow-card-glow cursor-pointer transition-all"
          >
            <span>Continuar a Datos del Comprador</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 2: Datos del Comprador */}
      {step === 2 && (
        <div className="p-4 rounded-3xl glass-card space-y-4 animate-fadeIn">
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-white flex items-center space-x-1.5">
              <User className="w-4 h-4 text-brand-400" />
              <span>Paso 2: Datos del Titular</span>
            </h3>
            <p className="text-xs text-slate-400">Información para la reserva y elaboración del expediente.</p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Nombres y Apellidos Completos *</label>
              <input
                type="text"
                placeholder="Ej. Juan Carlos Pérez Morales"
                value={nombres}
                onChange={(e) => setNombres(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-white text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Número de Cédula *</label>
              <input
                type="text"
                placeholder="000-000000-0000X"
                value={identificacion}
                onChange={(e) => setIdentificacion(formatCedula(e.target.value))}
                maxLength={16}
                className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-white text-xs font-mono focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Teléfono / WhatsApp *</label>
              <input
                type="tel"
                placeholder="+505 8888-8888"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-white text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Dirección Domiciliar</label>
              <textarea
                rows={2}
                placeholder="Ciudad, barrio y punto de referencia..."
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                className="w-full px-3.5 py-2 rounded-2xl glass-input text-white text-xs focus:outline-none resize-none"
              />
            </div>

            {/* Código de Referido o Asesor */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-amber-400" />
                  <span>Código de Referido / Asesor</span>
                  <span className="text-slate-500 font-normal text-[11px]">(Opcional)</span>
                </label>
                {codigoReferido && (
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                    Bono $20 Activo
                  </span>
                )}
              </div>
              <input
                type="text"
                placeholder="Ej. AMSA-CARLOS-42 o ARIEL20"
                value={codigoReferido}
                onChange={(e) => setCodigoReferido(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-amber-300 font-mono font-bold text-xs focus:outline-none placeholder-slate-600 uppercase"
              />
              {codigoReferido ? (
                <p className="text-[11px] text-amber-300/90 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                  Tu asesor/referidor recibirá $20 USD de recompensa al validarse tu prima.
                </p>
              ) : (
                <p className="text-[10px] text-slate-500">
                  Si alguien te recomendó o tienes el código de tu asesor, ingrésalo aquí.
                </p>
              )}
            </div>
          </div>

          <div className="flex space-x-2 pt-2">
            <button
              onClick={() => setStep(1)}
              className="w-1/3 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
            >
              Atrás
            </button>
            <button
              disabled={!nombres || !identificacion || !telefono}
              onClick={() => setStep(3)}
              className="flex-1 py-3 rounded-2xl bg-brand-500 disabled:opacity-50 hover:bg-brand-400 text-navy-950 font-black text-xs flex items-center justify-center space-x-1.5 shadow-card-glow transition-all cursor-pointer"
            >
              <span>Continuar a Depósito de Prima</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Depósito y Voucher */}
      {step === 3 && (
        <div className="p-4 rounded-3xl glass-card space-y-4 animate-fadeIn">
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-white flex items-center space-x-1.5">
              <CreditCard className="w-4 h-4 text-brand-400" />
              <span>Paso 3: Depósito de Prima / Primer Abono y Voucher</span>
            </h3>
            <p className="text-xs text-slate-400">Selecciona la cuenta y adjunta la foto del comprobante o boucher.</p>
          </div>

          {/* Cuentas Bancarias */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Cuenta Bancaria Destino</label>
            <div className="space-y-2">
              {cuentasBancarias.map((cta) => (
                <div
                  key={cta.id}
                  onClick={() => setSelectedCuentaId(cta.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    selectedCuentaId === cta.id
                      ? 'bg-brand-500/10 border-brand-500 text-white'
                      : 'bg-navy-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">{cta.banco} ({cta.moneda})</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {cta.tipo_cuenta}
                    </span>
                  </div>
                  <p className="text-xs font-mono font-bold text-brand-400 mt-1">{cta.numero_cuenta}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Titular: {cta.titular}</p>
                </div>
              ))}
            </div>
          </div>

          {step3Error && (
            <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{step3Error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Monto Anticipo ($)</label>
              <input
                type="number"
                min="1"
                step="1"
                placeholder="Ej. 100"
                value={montoAnticipo || ''}
                onKeyDown={(e) => {
                  if (['-', '+', 'e', 'E'].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                onWheel={(e) => (e.target as HTMLElement).blur()}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setMontoAnticipo(isNaN(v) ? 0 : Math.max(0, v));
                  setStep3Error(null);
                }}
                className="w-full px-3 py-2 rounded-2xl glass-input text-white text-xs font-bold font-mono focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">N° Transacción/Ref</label>
              <input
                type="text"
                placeholder="Ej. 984512"
                value={numReferencia}
                onChange={(e) => setNumReferencia(e.target.value)}
                className="w-full px-3 py-2 rounded-2xl glass-input text-white text-xs focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Photo Capture */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Foto del Comprobante / Voucher</label>
            {photo ? (
              <div className="relative rounded-2xl overflow-hidden border border-brand-500/50 bg-slate-900">
                <img src={photo.dataUrl} alt="Comprobante" className="w-full h-40 object-contain" />
                <button
                  onClick={clearPhoto}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white shadow-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => takePhoto()}
                disabled={isCapturing}
                className="w-full py-4 border-2 border-dashed border-slate-700 hover:border-brand-500 rounded-2xl flex flex-col items-center justify-center space-y-1 text-slate-400 hover:text-brand-400 transition-all bg-navy-900/40"
              >
                <Camera className="w-6 h-6" />
                <span className="text-xs font-bold">Tomar Foto o Subir Voucher</span>
                <span className="text-[10px] text-slate-500">Capacitor Camera / Galería</span>
              </button>
            )}
          </div>

          <div className="flex space-x-2 pt-2">
            <button
              onClick={() => setStep(2)}
              className="w-1/3 py-3 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xs"
            >
              Atrás
            </button>
            <button
              disabled={submitting}
              onClick={handleSubmitReservation}
              className="flex-1 py-3 rounded-2xl bg-brand-500 disabled:opacity-50 text-navy-950 font-black text-xs flex items-center justify-center space-x-1.5 shadow-card-glow"
            >
              {submitting ? (
                <span>Procesando...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirmar Pre-Reserva</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
