import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Image as ImageIcon,
  Edit3,
  MapPin,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Save,
  Lock,
  KeyRound,
  LogOut,
  ShieldAlert,
  FileCheck,
  Gift,
  DollarSign,
  Eye,
  X,
  Phone,
  User,
  CreditCard,
  AlertCircle,
  Plus,
  Trash2,
  Landmark
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Lotificacion, Formalizacion, CuentaBancaria } from '../../types/models';
import { api } from '../../api/client';
import { formatCurrency } from '../../utils/formatters';

export const AdminProjectListPage: React.FC = () => {
  const navigate = useNavigate();

  // Admin Auth State (PIN/Clave Maestra)
  const [isAdminAuth, setIsAdminAuth] = useState<boolean>(() => {
    return sessionStorage.getItem('admin_logged') === 'true';
  });
  const [adminPin, setAdminPin] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Tabs
  const [adminTab, setAdminTab] = useState<'formalizaciones' | 'cuentas' | 'proyectos'>('formalizaciones');

  // Projects State
  const [projects, setProjects] = useState<Lotificacion[]>([]);
  const [loadingProjects, setLoadingProjects] = useState<boolean>(true);
  const [editingProject, setEditingProject] = useState<Lotificacion | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Formalizaciones State
  const [formalizaciones, setFormalizaciones] = useState<Formalizacion[]>([]);
  const [loadingFormalizaciones, setLoadingFormalizaciones] = useState<boolean>(true);
  const [previewVoucherUrl, setPreviewVoucherUrl] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Cuentas Bancarias State
  const [cuentasBancarias, setCuentasBancarias] = useState<CuentaBancaria[]>([]);
  const [loadingCuentas, setLoadingCuentas] = useState<boolean>(true);
  const [editingCuenta, setEditingCuenta] = useState<CuentaBancaria | null>(null);
  const [isCreatingCuenta, setIsCreatingCuenta] = useState<boolean>(false);

  // Form State Cuentas
  const [bancoNombre, setBancoNombre] = useState<string>('BAC Credomatic');
  const [numeroCuenta, setNumeroCuenta] = useState<string>('');
  const [tipoCuenta, setTipoCuenta] = useState<'Corriente' | 'Ahorro'>('Corriente');
  const [monedaCuenta, setMonedaCuenta] = useState<'USD' | 'NIO'>('USD');
  const [titularCuenta, setTitularCuenta] = useState<string>('PROYECTOS SAN MIGUEL S.A.');

  // Form State Proyectos
  const [nombre, setNombre] = useState<string>('');
  const [ubicacion, setUbicacion] = useState<string>('');
  const [descripcion, setDescripcion] = useState<string>('');
  const [precioDesde, setPrecioDesde] = useState<number>(8500);
  const [imagenUrl, setImagenUrl] = useState<string>('');
  const [amenidadesText, setAmenidadesText] = useState<string>('');

  const loadData = async () => {
    setLoadingProjects(true);
    setLoadingFormalizaciones(true);
    setLoadingCuentas(true);
    try {
      const [projs, forms, cuentas] = await Promise.all([
        api.getLotificaciones(),
        api.getFormalizaciones(),
        api.getCuentasBancarias()
      ]);
      setProjects(projs);
      setFormalizaciones(forms);
      setCuentasBancarias(cuentas);
    } finally {
      setLoadingProjects(false);
      setLoadingFormalizaciones(false);
      setLoadingCuentas(false);
    }
  };

  useEffect(() => {
    if (isAdminAuth) {
      loadData();
    }
  }, [isAdminAuth]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPin.trim() === 'amsa2026' || adminPin.trim() === 'admin123' || adminPin.trim() === '1234') {
      setIsAdminAuth(true);
      sessionStorage.setItem('admin_logged', 'true');
      setPinError(null);
      loadData();
    } else {
      setPinError('Contraseña o PIN incorrecto. Acceso restringido al personal autorizado.');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuth(false);
    sessionStorage.removeItem('admin_logged');
    navigate('/');
  };

  // ==================== PROJECT HANDLERS ====================
  const handleOpenEdit = (proj: Lotificacion) => {
    setEditingProject(proj);
    setNombre(proj.nombre);
    setUbicacion(proj.ubicacion);
    setDescripcion(proj.descripcion || '');
    setPrecioDesde(proj.precio_desde || 8500);
    setImagenUrl(proj.imagen_principal || '');
    setAmenidadesText((proj.amenidades || ['Agua Potable', 'Energía Eléctrica', 'Calles Adoquinadas']).join(', '));
    setSavedSuccess(false);
  };

  const handleSaveProject = () => {
    if (!editingProject) return;

    const amenidadesArray = amenidadesText
      .split(',')
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    const updatedProjects = projects.map((p) => {
      if (p.id === editingProject.id) {
        return {
          ...p,
          nombre,
          ubicacion,
          descripcion,
          precio_desde: precioDesde,
          imagen_principal: imagenUrl,
          amenidades: amenidadesArray,
        };
      }
      return p;
    });

    setProjects(updatedProjects);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setEditingProject(null);
    }, 1200);
  };

  // ==================== FORMALIZACION HANDLERS ====================
  const handleAprobarFormalizacion = async (form: Formalizacion) => {
    try {
      const res = await api.aprobarFormalizacion(form.id);
      setActionMessage(res.message);
      setTimeout(() => setActionMessage(null), 5000);

      setFormalizaciones(prev =>
        prev.map(f =>
          f.id === form.id
            ? { ...f, estado: 'Aprobada', comision_acreditada: true, fecha_aprobacion: new Date().toISOString().split('T')[0] }
            : f
        )
      );

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      alert(err.message || 'Error al aprobar formalización');
    }
  };

  const handleRechazarFormalizacion = async (form: Formalizacion) => {
    if (!window.confirm(`¿Estás seguro de rechazar la formalización ${form.id}?`)) return;
    try {
      const res = await api.rechazarFormalizacion(form.id);
      setActionMessage(res.message);
      setTimeout(() => setActionMessage(null), 4000);

      setFormalizaciones(prev =>
        prev.map(f =>
          f.id === form.id
            ? { ...f, estado: 'Rechazada', fecha_aprobacion: new Date().toISOString().split('T')[0] }
            : f
        )
      );
    } catch (err: any) {
      alert(err.message || 'Error al rechazar');
    }
  };

  // ==================== CUENTAS BANCARIAS HANDLERS ====================
  const handleOpenCreateCuenta = () => {
    setEditingCuenta(null);
    setBancoNombre('BAC Credomatic');
    setNumeroCuenta('');
    setTipoCuenta('Corriente');
    setMonedaCuenta('USD');
    setTitularCuenta('PROYECTOS SAN MIGUEL S.A.');
    setIsCreatingCuenta(true);
  };

  const handleOpenEditCuenta = (cta: CuentaBancaria) => {
    setEditingCuenta(cta);
    setBancoNombre(cta.banco);
    setNumeroCuenta(cta.numero_cuenta);
    setTipoCuenta(cta.tipo_cuenta as 'Corriente' | 'Ahorro');
    setMonedaCuenta(cta.moneda as 'USD' | 'NIO');
    setTitularCuenta(cta.titular);
    setIsCreatingCuenta(true);
  };

  const handleSaveCuenta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!numeroCuenta.trim() || !titularCuenta.trim()) {
      alert('Por favor completa todos los campos de la cuenta.');
      return;
    }

    const payload: CuentaBancaria = {
      id: editingCuenta ? editingCuenta.id : 0,
      banco: bancoNombre,
      numero_cuenta: numeroCuenta.trim(),
      tipo_cuenta: tipoCuenta,
      moneda: monedaCuenta,
      titular: titularCuenta.trim()
    };

    const res = await api.saveCuentaBancaria(payload);
    setActionMessage(res.message);
    setTimeout(() => setActionMessage(null), 4000);

    const updated = await api.getCuentasBancarias();
    setCuentasBancarias(updated);
    setIsCreatingCuenta(false);
    setEditingCuenta(null);
  };

  const handleDeleteCuenta = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar esta cuenta bancaria?')) return;
    const res = await api.deleteCuentaBancaria(id);
    setActionMessage(res.message);
    setTimeout(() => setActionMessage(null), 4000);

    const updated = await api.getCuentasBancarias();
    setCuentasBancarias(updated);
  };

  // 🔒 Si NO está autenticado, mostrar pantalla de bloqueo con Clave/PIN
  if (!isAdminAuth) {
    return (
      <div className="py-8 space-y-6 animate-fadeIn max-w-sm mx-auto">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-red-500/20 text-red-400 border border-red-500/30 mx-auto flex items-center justify-center shadow-lg">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-white">Acceso Administrativo</h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Este módulo es exclusivo para el personal autorizado de Proyectos San Miguel (AMSAsystem).
          </p>
        </div>

        {pinError && (
          <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{pinError}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="p-5 rounded-3xl glass-card border border-slate-800 space-y-4 shadow-glass">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
              <KeyRound className="w-3.5 h-3.5 text-brand-400" />
              <span>Contraseña Maestra / Clave de Acceso</span>
            </label>
            <input
              type="password"
              placeholder="Ingresa la clave (ej. 1234)"
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value)}
              className="w-full px-3.5 py-3 rounded-2xl glass-input text-white text-sm font-mono focus:outline-none"
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-brand-500 hover:bg-brand-400 text-navy-950 font-black text-xs shadow-card-glow active:scale-98 transition-all cursor-pointer"
          >
            Ingresar al Panel Administrativo
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="text-xs text-slate-400 hover:text-white cursor-pointer"
          >
            ← Volver a la App Principal
          </button>
        </div>
      </div>
    );
  }

  // 🔓 Pantalla de Administración Desbloqueada
  return (
    <div className="space-y-5 animate-fadeIn pb-10 max-w-3xl mx-auto">
      {/* Toast Alert */}
      {actionMessage && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-navy-950 font-bold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs sm:text-sm animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Header con botón de salir */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest block">Módulo Autorizado</span>
          <h2 className="text-base font-black text-white">Panel de Control AMSA</h2>
        </div>
        <button
          onClick={handleAdminLogout}
          className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 cursor-pointer"
          title="Cerrar Sesión Admin"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Tabs Admin */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setAdminTab('formalizaciones')}
          className={`pb-3 px-3.5 text-xs sm:text-sm font-bold transition-all relative cursor-pointer whitespace-nowrap ${
            adminTab === 'formalizaciones'
              ? 'text-amber-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <FileCheck className="w-4 h-4" />
            Formalizaciones ({formalizaciones.filter(f => f.estado === 'Pendiente').length} pend.)
          </span>
          {adminTab === 'formalizaciones' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setAdminTab('cuentas')}
          className={`pb-3 px-3.5 text-xs sm:text-sm font-bold transition-all relative cursor-pointer whitespace-nowrap ${
            adminTab === 'cuentas'
              ? 'text-emerald-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Landmark className="w-4 h-4" />
            Cuentas Bancarias ({cuentasBancarias.length})
          </span>
          {adminTab === 'cuentas' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setAdminTab('proyectos')}
          className={`pb-3 px-3.5 text-xs sm:text-sm font-bold transition-all relative cursor-pointer whitespace-nowrap ${
            adminTab === 'proyectos'
              ? 'text-brand-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4" />
            Proyectos ({projects.length})
          </span>
          {adminTab === 'proyectos' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-400 rounded-full" />
          )}
        </button>
      </div>

      {/* ==================== TAB 1: FORMALIZACIONES Y VOUCHERS ==================== */}
      {adminTab === 'formalizaciones' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-slate-900/80 border border-amber-500/20 space-y-1 shadow-glass">
            <h3 className="text-xs font-bold text-white flex items-center space-x-1.5">
              <Gift className="w-4 h-4 text-amber-400" />
              <span>Validación de Vouchers y Acreditación de Comisiones ($20 USD)</span>
            </h3>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Al aprobar un comprobante de formalización con código de referido, el sistema activará y acreditará automáticamente la comisión de <strong>$20.00 USD</strong> en la billetera del vendedor o promotor.
            </p>
          </div>

          {loadingFormalizaciones ? (
            <div className="space-y-3">
              {[1, 2].map((n) => (
                <div key={n} className="h-36 rounded-3xl glass-card animate-shimmer" />
              ))}
            </div>
          ) : formalizaciones.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-slate-900/60 border border-slate-800">
              <FileCheck className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No hay formalizaciones registradas aún.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {formalizaciones.map((form) => {
                const isPending = form.estado === 'Pendiente';
                const isApproved = form.estado === 'Aprobada';

                return (
                  <div
                    key={form.id}
                    className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-glass"
                  >
                    {/* Header Formalizacion */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-brand-400">{form.id}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              isApproved
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : isPending
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                : 'bg-red-500/20 text-red-300 border-red-500/30'
                            }`}
                          >
                            {form.estado}
                          </span>
                        </div>
                        <h4 className="text-base font-black text-white mt-1">{form.nombres_apellidos}</h4>
                        <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap mt-0.5">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                            {form.telefono}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            {form.lotificacion_nombre} ({form.lote_identificador})
                          </span>
                        </div>
                      </div>

                      <div className="text-left sm:text-right bg-slate-800/60 sm:bg-transparent p-2 sm:p-0 rounded-xl">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                          Monto Prima
                        </span>
                        <span className="text-base font-black text-emerald-400">
                          ${form.monto_anticipo.toFixed(2)} <span className="text-xs text-slate-400">USD</span>
                        </span>
                      </div>
                    </div>

                    {/* Voucher & Referral Code Banner */}
                    <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        {form.codigo_referido ? (
                          <div className="flex items-center gap-1.5">
                            <Gift className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-xs text-slate-200">
                              Código Promotor: <strong className="text-amber-300 font-mono">{form.codigo_referido}</strong>
                            </span>
                            <span className="px-2 py-0.2 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold">
                              Comisión: $20.00 USD
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500">Cliente directo (sin código de referido)</span>
                        )}
                        <div className="text-[11px] text-slate-400">
                          Ref: {form.referencia_bancaria || 'No especificada'} • {form.fecha_registro}
                        </div>
                      </div>

                      {form.comprobante_voucher && (
                        <button
                          onClick={() => setPreviewVoucherUrl(form.comprobante_voucher || null)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer self-start sm:self-auto"
                        >
                          <Eye className="w-3.5 h-3.5 text-brand-400" />
                          <span>Ver Voucher</span>
                        </button>
                      )}
                    </div>

                    {/* Action Buttons for Admin */}
                    {isPending && (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleRechazarFormalizacion(form)}
                          className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-red-400 text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
                        >
                          Rechazar
                        </button>
                        <button
                          onClick={() => handleAprobarFormalizacion(form)}
                          className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Aprobar Formalización {form.codigo_referido ? '& Activar Comisión ($20)' : ''}</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB 2: CUENTAS BANCARIAS ==================== */}
      {adminTab === 'cuentas' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-slate-900/80 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-glass">
            <div>
              <h3 className="text-xs font-bold text-white flex items-center space-x-1.5">
                <Landmark className="w-4 h-4 text-emerald-400" />
                <span>Gestor de Cuentas Bancarias de Destino</span>
              </h3>
              <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
                Las cuentas configuradas aquí se muestran a los clientes al momento de formalizar su lote y reportar transferencias.
              </p>
            </div>
            <button
              onClick={handleOpenCreateCuenta}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nueva Cuenta</span>
            </button>
          </div>

          {loadingCuentas ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-28 rounded-3xl glass-card animate-shimmer" />
              ))}
            </div>
          ) : cuentasBancarias.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-2">
              <Landmark className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-xs text-slate-400">No hay cuentas bancarias configuradas.</p>
              <button
                onClick={handleOpenCreateCuenta}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-navy-950 text-xs font-bold"
              >
                Crear primera cuenta
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {cuentasBancarias.map((cta) => (
                <div
                  key={cta.id}
                  className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-glass hover:border-emerald-500/30 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm sm:text-base font-bold text-white">{cta.banco}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {cta.moneda}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        {cta.tipo_cuenta}
                      </span>
                    </div>

                    <div className="text-xs font-mono font-bold text-brand-400">
                      {cta.numero_cuenta}
                    </div>

                    <p className="text-[11px] text-slate-400">
                      Titular: <strong className="text-slate-200">{cta.titular}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleOpenEditCuenta(cta)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Editar Cuenta"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCuenta(cta.id)}
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 transition-colors cursor-pointer"
                      title="Eliminar Cuenta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB 3: PROYECTOS ==================== */}
      {adminTab === 'proyectos' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl glass-card border border-brand-500/20 space-y-1 shadow-glass">
            <h3 className="text-xs font-bold text-white flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>Gestor de Catálogo de Proyectos</span>
            </h3>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Edita precios de referencia, fotos y amenidades que los clientes ven en el catálogo público.
            </p>
          </div>

          <div className="space-y-3">
            {loadingProjects ? (
              <div className="space-y-3">
                {[1, 2].map((n) => (
                  <div key={n} className="h-36 rounded-3xl glass-card animate-shimmer" />
                ))}
              </div>
            ) : (
              projects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-4 rounded-3xl glass-card border border-slate-800 space-y-3 hover:border-brand-500/40 transition-all shadow-glass"
                >
                  <div className="flex space-x-3 items-center">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 shrink-0">
                      <img
                        src={proj.imagen_principal || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80'}
                        alt={proj.nombre}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-brand-400 uppercase">{proj.estado || 'Activo'}</span>
                      <h4 className="text-sm font-black text-white truncate">{proj.nombre}</h4>
                      <p className="text-[11px] text-slate-400 flex items-center space-x-1 truncate mt-0.5">
                        <MapPin className="w-3 h-3 text-brand-400 shrink-0" />
                        <span className="truncate">{proj.ubicacion}</span>
                      </p>
                      <p className="text-xs font-black text-brand-400 mt-1">
                        Desde {formatCurrency(proj.precio_desde || 8500)}
                      </p>
                    </div>

                    <button
                      onClick={() => handleOpenEdit(proj)}
                      className="p-2.5 rounded-2xl bg-brand-500/20 text-brand-400 hover:bg-brand-500 hover:text-navy-950 transition-all cursor-pointer"
                      title="Editar Proyecto"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal Crear / Editar Cuenta Bancaria */}
      {isCreatingCuenta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Landmark className="w-4 h-4 text-emerald-400" />
                <span>{editingCuenta ? 'Editar Cuenta Bancaria' : 'Nueva Cuenta Bancaria'}</span>
              </h3>
              <button
                onClick={() => {
                  setIsCreatingCuenta(false);
                  setEditingCuenta(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCuenta} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Nombre del Banco</label>
                <input
                  type="text"
                  placeholder="Ej. BAC Credomatic o Banco LAFISE"
                  value={bancoNombre}
                  onChange={(e) => setBancoNombre(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Moneda</label>
                  <select
                    value={monedaCuenta}
                    onChange={(e) => setMonedaCuenta(e.target.value as 'USD' | 'NIO')}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 text-white text-xs border border-slate-700 cursor-pointer"
                  >
                    <option value="USD">Dólares (USD)</option>
                    <option value="NIO">Córdobas (NIO)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Tipo de Cuenta</label>
                  <select
                    value={tipoCuenta}
                    onChange={(e) => setTipoCuenta(e.target.value as 'Corriente' | 'Ahorro')}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 text-white text-xs border border-slate-700 cursor-pointer"
                  >
                    <option value="Corriente">Corriente</option>
                    <option value="Ahorro">Ahorro</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Número de Cuenta</label>
                <input
                  type="text"
                  placeholder="Ej. 365-894120-1"
                  value={numeroCuenta}
                  onChange={(e) => setNumeroCuenta(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Titular de la Cuenta</label>
                <input
                  type="text"
                  placeholder="Ej. PROYECTOS SAN MIGUEL S.A."
                  value={titularCuenta}
                  onChange={(e) => setTitularCuenta(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-xs focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingCuenta(false);
                    setEditingCuenta(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-bold text-xs shadow-md flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Cuenta</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Proyecto */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Editar Proyecto: {editingProject.nombre}</h3>
              <button
                onClick={() => setEditingProject(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Nombre del Proyecto</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Ubicación</label>
                <input
                  type="text"
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Precio Base Desde ($)</label>
                <input
                  type="number"
                  min="1000"
                  step="100"
                  value={precioDesde}
                  onKeyDown={(e) => {
                    if (['-', '+', 'e', 'E'].includes(e.key)) e.preventDefault();
                  }}
                  onWheel={(e) => (e.target as HTMLElement).blur()}
                  onChange={(e) => setPrecioDesde(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl glass-input text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">URL Imagen Principal</label>
                <input
                  type="text"
                  value={imagenUrl}
                  onChange={(e) => setImagenUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-white text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Amenidades (Separadas por comas)</label>
                <input
                  type="text"
                  value={amenidadesText}
                  onChange={(e) => setAmenidadesText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-white text-xs"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setEditingProject(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveProject}
                className="flex-1 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-navy-950 font-bold text-xs shadow-card-glow flex items-center justify-center gap-1 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Cambios</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Preview Voucher Image */}
      {previewVoucherUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/90 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white">Comprobante / Voucher de Pago</h4>
              <button
                onClick={() => setPreviewVoucherUrl(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center p-2">
              <img
                src={previewVoucherUrl}
                alt="Voucher de depósito"
                className="max-h-[65vh] w-auto object-contain rounded-xl"
              />
            </div>
            <button
              onClick={() => setPreviewVoucherUrl(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
            >
              Cerrar Vista Previa
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
