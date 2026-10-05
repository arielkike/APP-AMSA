import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  Users, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Gift, 
  HelpCircle, 
  Calculator, 
  ShieldCheck, 
  Send 
} from 'lucide-react';

interface GuestReferralHeroProps {
  onLoginClick?: () => void;
}

export const GuestReferralHero: React.FC<GuestReferralHeroProps> = ({ onLoginClick }) => {
  const navigate = useNavigate();
  const [numReferidos, setNumReferidos] = useState<number>(3);
  const comisionPorLote = 20; // $20 USD

  const handleLogin = () => {
    if (onLoginClick) {
      onLoginClick();
    } else {
      navigate('/auth/login');
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-navy-950 p-6 text-white shadow-2xl border border-brand-500/20">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-4 bottom-4 opacity-10 pointer-events-none">
          <Gift className="w-36 h-36" />
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Programa de Embajadores AMSA
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            Gana <span className="text-amber-300">${comisionPorLote} USD</span> por cada amigo que formalice su lote
          </h1>
          <p className="text-slate-200 text-sm leading-relaxed mb-6">
            Recomienda nuestros proyectos inmobiliarios. Sin límites de ganancia: cuando tu referido formaliza su prima o terreno con su comprobante, recibes tu recompensa de $20 USD en tu billetera.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleLogin}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-navy-950 font-bold text-sm shadow-lg shadow-amber-400/20 transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <Users className="w-4 h-4" />
              Ingresar para Empezar a Referir
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Earnings Calculator */}
      <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Calculadora de Ganancias</h2>
              <p className="text-xs text-slate-400">¿Cuánto dinero puedes generar?</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
            ${comisionPorLote} / Lote
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center text-sm font-medium mb-2">
              <span className="text-slate-300">Amigos o clientes referidos:</span>
              <span className="text-amber-400 font-bold text-base">{numReferidos} {numReferidos === 1 ? 'persona' : 'personas'}</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={numReferidos}
              onChange={(e) => setNumReferidos(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1">
              <span>1 persona ($20)</span>
              <span>5 personas ($100)</span>
              <span>20 personas ($400)</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-brand-500/10 to-transparent border border-amber-500/20 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider block font-medium">Tu Premio Estimado</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-300">
                ${(numReferidos * comisionPorLote).toLocaleString()} <span className="text-sm font-normal text-slate-400">USD</span>
              </span>
            </div>
            <button
              onClick={handleLogin}
              className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-white font-semibold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Comenzar Ya
            </button>
          </div>
        </div>
      </div>

      {/* How it works (3 Steps) */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-400" />
          ¿Cómo funciona el programa?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 relative overflow-hidden">
            <span className="absolute right-3 top-2 text-4xl font-black text-slate-800 pointer-events-none select-none">
              1
            </span>
            <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-sm mb-3">
              <Send className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">1. Registra o Comparte</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ingresa los datos de tu contacto en la app o envíale tu enlace directo por WhatsApp.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 relative overflow-hidden">
            <span className="absolute right-3 top-2 text-4xl font-black text-slate-800 pointer-events-none select-none">
              2
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm mb-3">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">2. Nosotros lo atendemos</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Nuestros asesores expertos le brindan asesoría, coordinan la visita y cierran la venta.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 relative overflow-hidden">
            <span className="absolute right-3 top-2 text-4xl font-black text-slate-800 pointer-events-none select-none">
              3
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm mb-3">
              <DollarSign className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">3. Recibe tu Comisión</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Al firmar el contrato, tu comisión se acredita y solicitas tu transferencia en 24h.
            </p>
          </div>
        </div>
      </div>

      {/* Trust & Transparency Badges */}
      <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-white">Transparencia Total</h4>
            <p className="text-[11px] text-slate-400">
              Podrás ver el estado en tiempo real de cada uno de tus referidos en tu panel de control.
            </p>
          </div>
        </div>
        <button
          onClick={handleLogin}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700 whitespace-nowrap cursor-pointer"
        >
          Iniciar Sesión
        </button>
      </div>

      {/* FAQ Section */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-slate-400" />
          Preguntas Frecuentes
        </h2>

        <div className="space-y-2">
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs">
            <div className="font-semibold text-white mb-1">¿Necesito ser cliente propietario para referir?</div>
            <p className="text-slate-400">
              Cualquier persona registrada en nuestra plataforma puede convertirse en Embajador AMSA y cobrar sus comisiones.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs">
            <div className="font-semibold text-white mb-1">¿Cómo y cuándo me pagan?</div>
            <p className="text-slate-400">
              Una vez que tu referido firma el contrato y abona la prima de su lote, la comisión queda disponible en tu billetera para transferirla a BAC, LAFISE, Banpro o cobrarla en caja.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs">
            <div className="font-semibold text-white mb-1">¿Hay un límite de personas a referir?</div>
            <p className="text-slate-400">
              ¡No hay límites! Puedes referir tantos contactos como desees y acumular ganancias ilimitadas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
