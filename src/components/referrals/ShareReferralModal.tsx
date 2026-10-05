import React, { useState } from 'react';
import { X, Share2, Copy, Check, MessageSquare, QrCode, Sparkles } from 'lucide-react';
import { BilleteraReferidosSummary } from '../../types/models';

interface ShareReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: BilleteraReferidosSummary;
}

export const ShareReferralModal: React.FC<ShareReferralModalProps> = ({
  isOpen,
  onClose,
  summary,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const referralCode = summary.codigo_promotor_personal || 'AMSA-PROMO';
  const referralLink = summary.enlace_compartir || `https://proyectosanmiguel.com/app?ref=${referralCode}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleShareWhatsApp = () => {
    const message = encodeURIComponent(
      `¡Hola! Te recomiendo los proyectos de lotes y terrenos de AMSA con financiamiento directo sin bancos. Conoce los proyectos y cotiza tu lote aquí con mi invitación: ${referralLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Terrenos y Lotes con Financiamiento AMSA',
          text: 'Te invito a conocer los proyectos de lotes en desarrollo con financiamiento propio y cuotas accesibles.',
          url: referralLink,
        });
      } catch {
        // Ignored or cancelled
      }
    } else {
      handleShareWhatsApp();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-navy-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Compartir mi Invitación</h3>
              <p className="text-xs text-slate-400">Gana comisiones al compartir tu enlace</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Promo Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-brand-500/10 to-slate-900 border border-amber-500/30 text-center relative overflow-hidden">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-bold mb-2">
              <Sparkles className="w-3 h-3" />
              Tu Código de Embajador
            </div>
            <div className="text-2xl font-black text-white tracking-widest my-1 font-mono">
              {referralCode}
            </div>
            <p className="text-xs text-slate-400">
              Cualquier persona que se registre con este código se asignará automáticamente a tu billetera.
            </p>
            <div className="mt-3 flex justify-center">
              <button
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Código Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Código</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Enlace Directo */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Enlace Web Personalizado
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none select-all"
              />
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="pt-2 space-y-2.5">
            <button
              onClick={handleShareWhatsApp}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <MessageSquare className="w-4 h-4" />
              Enviar por WhatsApp
            </button>

            <button
              onClick={handleNativeShare}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              Más opciones de compartir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
