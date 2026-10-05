import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Shield,
  Fingerprint,
  Bell,
  MessageCircle,
  LogOut,
  ArrowLeft,
  FileCheck,
  Phone,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { cliente, logout, biometricsEnabled, setBiometricsEnabled } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const openWhatsAppSupport = () => {
    const text = encodeURIComponent(
      `Hola Proyectos San Miguel, soy el cliente ${cliente?.nombres_apellidos} (Expediente: ${cliente?.expediente_num}). Deseo realizar una consulta sobre mi contrato.`
    );
    window.open(`https://wa.me/50588997711?text=${text}`, '_system');
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
        <h2 className="text-base font-black text-white">Mi Perfil y Configuración</h2>
        <div className="w-9" />
      </div>

      {/* User Card */}
      <div className="p-5 rounded-3xl glass-card space-y-3 border border-brand-500/20 text-center shadow-glass">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-brand-600 to-brand-400 mx-auto flex items-center justify-center text-navy-950 text-2xl font-black shadow-card-glow">
          {cliente?.nombres_apellidos?.charAt(0) || 'C'}
        </div>
        <div>
          <h3 className="text-lg font-black text-white">{cliente?.nombres_apellidos || 'Carlos Mendoza'}</h3>
          <p className="text-xs text-brand-400 font-mono font-bold mt-0.5">
            Expediente: {cliente?.expediente_num || 'EXP-0202-1'}
          </p>
        </div>
      </div>

      {/* Details List */}
      <div className="p-4 rounded-3xl glass-card space-y-3 text-xs">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Datos Registrados</h4>

        <div className="flex items-center space-x-3 p-2.5 rounded-2xl bg-navy-900/60 border border-slate-800">
          <Shield className="w-4 h-4 text-brand-400 shrink-0" />
          <div className="flex-1">
            <span className="text-[10px] text-slate-400 block">Cédula de Identidad</span>
            <span className="font-mono font-bold text-white">{cliente?.identificacion}</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-2.5 rounded-2xl bg-navy-900/60 border border-slate-800">
          <Phone className="w-4 h-4 text-brand-400 shrink-0" />
          <div className="flex-1">
            <span className="text-[10px] text-slate-400 block">Teléfono de Contacto</span>
            <span className="font-medium text-white">{cliente?.telefono}</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-2.5 rounded-2xl bg-navy-900/60 border border-slate-800">
          <MapPin className="w-4 h-4 text-brand-400 shrink-0" />
          <div className="flex-1">
            <span className="text-[10px] text-slate-400 block">Dirección</span>
            <span className="font-medium text-white">{cliente?.direccion}</span>
          </div>
        </div>
      </div>

      {/* Security & Preferences */}
      <div className="p-4 rounded-3xl glass-card space-y-3">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Seguridad y Notificaciones</h4>

        {/* Biometrics Switch */}
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-navy-900/60 border border-slate-800">
          <div className="flex items-center space-x-3">
            <Fingerprint className="w-5 h-5 text-brand-400" />
            <div>
              <span className="text-xs font-bold text-white block">Acceso con Face ID / Huella</span>
              <span className="text-[10px] text-slate-400">Ingreso seguro sin volver a escribir expediente</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={biometricsEnabled}
            onChange={(e) => setBiometricsEnabled(e.target.value === 'true' || e.target.checked)}
            className="w-5 h-5 accent-brand-500 rounded cursor-pointer"
          />
        </div>

        {/* Push Notifications status */}
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-navy-900/60 border border-slate-800">
          <div className="flex items-center space-x-3">
            <Bell className="w-5 h-5 text-amber-400" />
            <div>
              <span className="text-xs font-bold text-white block">Recordatorios de Vencimiento</span>
              <span className="text-[10px] text-slate-400">Avisos 5 días antes y confirmación de abono</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 text-[10px] font-bold">
            Activo
          </span>
        </div>
      </div>

      {/* Support & Logout */}
      <div className="space-y-2.5">
        <button
          onClick={openWhatsAppSupport}
          className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg active:scale-98 transition-all"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Atención al Cliente por WhatsApp</span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-2xl bg-slate-800/80 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-xs flex items-center justify-center space-x-2 active:scale-98 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};
