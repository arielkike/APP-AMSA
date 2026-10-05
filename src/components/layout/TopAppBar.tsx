import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, WifiOff, ArrowLeft, Building2, User, Settings } from 'lucide-react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useAuth } from '../../context/AuthContext';

interface TopAppBarProps {
  title?: string;
  showBack?: boolean;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({ title, showBack }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const network = useNetworkStatus();
  const { isAuthenticated, cliente } = useAuth();

  const isClientArea = location.pathname.startsWith('/cliente');

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {showBack ? (
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/70 active:scale-95 text-slate-300 transition-all"
              aria-label="Volver"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center shadow-card-glow">
                <Building2 className="w-5 h-5 text-navy-950 font-bold" />
              </div>
              <div>
                <span className="text-xs font-semibold text-brand-400 tracking-wider uppercase">Proyectos</span>
                <h1 className="text-sm font-bold text-white tracking-tight -mt-0.5">San Miguel</h1>
              </div>
            </div>
          )}
          {title && (
            <h2 className="text-sm font-semibold text-slate-200 truncate max-w-[180px]">
              {title}
            </h2>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {!network.connected && (
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs animate-pulse">
              <WifiOff className="w-3.5 h-3.5" />
              <span className="text-[10px] font-medium">Offline</span>
            </div>
          )}

          {isAuthenticated ? (
            <button
              onClick={() => navigate('/cliente/perfil')}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-800/80 border border-brand-500/30 text-slate-200 text-xs hover:border-brand-500/60 active:scale-95 transition-all"
            >
              <div className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-[10px]">
                {cliente?.nombres_apellidos.charAt(0) || 'C'}
              </div>
              <span className="hidden sm:inline text-[11px] font-medium max-w-[70px] truncate">
                {cliente?.nombres_apellidos.split(' ')[0]}
              </span>
            </button>
          ) : (
            !isClientArea && (
              <button
                onClick={() => navigate('/auth/login')}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold hover:bg-brand-500/20 active:scale-95 transition-all"
              >
                <User className="w-3.5 h-3.5" />
                <span>Portal</span>
              </button>
            )
          )}
        </div>
      </div>
    </header>
  );
};
