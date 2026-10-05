import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, UserCheck, KeyRound, Fingerprint, ArrowRight, HelpCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatCedula } from '../../utils/formatters';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [identificacion, setIdentificacion] = useState<string>('');
  const [expediente, setExpediente] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!identificacion || !expediente) {
      setErrorMsg('Por favor ingresa tu cédula y número de expediente.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      await login(identificacion, expediente);
      navigate('/cliente/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn py-4">
      {/* Header Badge */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-brand-600 to-brand-400 mx-auto flex items-center justify-center shadow-card-glow text-navy-950">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white">Portal de Propietarios</h2>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          Accede a tus contratos, estados de cuenta, descarga de recibos y reporte de abonos.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleLogin} className="p-5 rounded-3xl glass-card space-y-4 shadow-glass">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
            <UserCheck className="w-3.5 h-3.5 text-brand-400" />
            <span>Número de Cédula</span>
          </label>
          <input
            type="text"
            placeholder="000-000000-0000X"
            value={identificacion}
            onChange={(e) => setIdentificacion(formatCedula(e.target.value))}
            maxLength={16}
            className="w-full px-3.5 py-3 rounded-2xl glass-input text-white text-sm font-mono focus:outline-none"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
            <KeyRound className="w-3.5 h-3.5 text-brand-400" />
            <span>N° de Expediente o Token</span>
          </label>
          <input
            type="text"
            placeholder="Ej. EXP-0202-1"
            value={expediente}
            onChange={(e) => setExpediente(e.target.value)}
            className="w-full px-3.5 py-3 rounded-2xl glass-input text-white text-sm font-mono focus:outline-none uppercase"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-2xl bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-navy-950 text-xs font-black flex items-center justify-center space-x-2 shadow-card-glow active:scale-98 transition-all"
        >
          {loading ? (
            <span>Verificando datos...</span>
          ) : (
            <>
              <span>Ingresar a Mi Cuenta</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Help Link */}
      <div className="text-center">
        <button
          onClick={() => alert('Para consultar tu número de expediente, revisa tu contrato de compraventa o comunícate al WhatsApp de atención a clientes: +505 8899-7711.')}
          className="inline-flex items-center space-x-1 text-xs text-slate-400 hover:text-brand-400 transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>¿No conoces tu N° de Expediente?</span>
        </button>
      </div>
    </div>
  );
};
