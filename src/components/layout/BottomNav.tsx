import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calculator, BookmarkCheck, LayoutDashboard, Gift } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const BottomNav: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const navItems = [
    {
      to: '/',
      label: 'Proyectos',
      icon: Home,
      end: true,
    },
    {
      to: '/simulador',
      label: 'Simulador',
      icon: Calculator,
    },
    {
      to: '/referidos',
      label: 'Gana $',
      icon: Gift,
      highlight: true,
    },
    {
      to: '/formalizar',
      label: 'Formalizar',
      icon: BookmarkCheck,
    },
    {
      to: isAuthenticated ? '/cliente/dashboard' : '/auth/login',
      label: isAuthenticated ? 'Mis Lotes' : 'Ingresar',
      icon: LayoutDashboard,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-navy-900/95 backdrop-blur-xl border-t border-slate-800/80 px-1 py-1.5 shadow-2xl">
      <div className="max-w-md mx-auto grid grid-cols-5 gap-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-200 ${
                  isActive
                    ? item.highlight
                      ? 'text-amber-400 bg-amber-500/15 font-bold shadow-sm'
                      : 'text-brand-400 bg-brand-500/10 font-semibold'
                    : item.highlight
                    ? 'text-amber-400/80 hover:text-amber-300 active:scale-95'
                    : 'text-slate-400 hover:text-slate-200 active:scale-95'
                }`
              }
            >
              <div className="relative">
                <Icon className={`w-5 h-5 mb-0.5 ${item.highlight ? 'text-amber-400' : ''}`} />
                {item.highlight && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                )}
              </div>
              <span className="text-[10px] leading-tight tracking-tight">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

