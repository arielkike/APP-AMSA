import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppRoutes } from './routes/AppRoutes';
import { AlertTriangle, X } from 'lucide-react';

function GlobalErrorBanner() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      console.error('[GlobalError]', event.error || event.message);
      setErrorMessage(`Error: ${event.message || 'Error inesperado en la aplicación'}`);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('[UnhandledRejection]', event.reason);
      const msg = event.reason?.message || (typeof event.reason === 'string' ? event.reason : 'Promesa rechazada no controlada');
      setErrorMessage(`Error de ejecución: ${msg}`);
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (!errorMessage) return null;

  return (
    <div className="fixed top-2 left-2 right-2 z-50 bg-red-600/95 backdrop-blur text-white p-3 rounded-2xl shadow-2xl border border-red-400 flex items-start justify-between gap-2 animate-fadeIn">
      <div className="flex items-start gap-2 text-xs">
        <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white block">Diagnóstico de la App:</span>
          <span className="text-red-100 font-mono text-[11px] break-all">{errorMessage}</span>
        </div>
      </div>
      <button
        onClick={() => setErrorMessage(null)}
        className="p-1 rounded-lg bg-red-700 hover:bg-red-800 text-white shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GlobalErrorBanner />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
