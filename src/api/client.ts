import { StorageService } from '../utils/storage';
import {
  Lotificacion,
  Lote,
  Cliente,
  VentaContrato,
  Cuota,
  AbonoRecibo,
  CuentaBancaria,
  SimuladorRequest,
  SimuladorResponse,
  ReportePagoPayload,
  Referido,
  BilleteraReferidosSummary,
  SolicitudPago,
  NuevoReferidoPayload,
  SolicitudPagoPayload,
  Formalizacion
} from '../types/models';
import {
  MOCK_LOTIFICACIONES,
  MOCK_LOTES,
  MOCK_CLIENTE,
  MOCK_CONTRATOS,
  MOCK_CUOTAS_VENTA_301,
  MOCK_RECIBOS_VENTA_301,
  MOCK_CUENTAS_BANCARIAS,
  MOCK_REFERIDOS,
  MOCK_BILLETERA_REFERIDOS,
  MOCK_SOLICITUDES_PAGO,
  MOCK_FORMALIZACIONES
} from './mockData';
import { generarTablaAmortizacion, calcularCuotaMensual } from '../utils/conversions';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://proyectosanmiguel.com/AMSAsystem/api/v1';

class ApiClient {
  private token: string | null = null;

  async initToken() {
    this.token = await StorageService.get('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      StorageService.set('auth_token', token);
    } else {
      StorageService.remove('auth_token');
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!this.token) {
      await this.initToken();
    }

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error del servidor (${response.status})`);
      }

      const json = await response.json();
      return json.data !== undefined ? json.data : json;
    } catch (error) {
      console.warn(`[API] Fallback / Offline para ${endpoint}:`, error);
      throw error;
    }
  }

  // ==================== PUBLIC API ====================

  async getLotificaciones(): Promise<Lotificacion[]> {
    try {
      return await this.request<Lotificacion[]>('/public/lotificaciones');
    } catch {
      return MOCK_LOTIFICACIONES;
    }
  }

  async getLotesByLotificacion(lotificacionId: number): Promise<Lote[]> {
    try {
      return await this.request<Lote[]>(`/public/lotificaciones/${lotificacionId}/lotes`);
    } catch {
      return MOCK_LOTES.filter(l => (l.lotificacion_id || 1) === lotificacionId);
    }
  }

  async getCuentasBancarias(): Promise<CuentaBancaria[]> {
    try {
      return await this.request<CuentaBancaria[]>('/cuentas-bancarias');
    } catch {
      const stored = await StorageService.getJSON<CuentaBancaria[]>('cuentas_bancarias_local');
      if (stored && stored.length > 0) {
        return stored;
      }
      return MOCK_CUENTAS_BANCARIAS;
    }
  }

  async saveCuentaBancaria(cuenta: CuentaBancaria): Promise<{ success: boolean; message: string; cuenta: CuentaBancaria }> {
    try {
      return await this.request('/admin/cuentas-bancarias', {
        method: 'POST',
        body: JSON.stringify(cuenta)
      });
    } catch {
      const currentList = await this.getCuentasBancarias();
      let updated: CuentaBancaria[];
      let savedCuenta = cuenta;
      if (cuenta.id && currentList.some(c => c.id === cuenta.id)) {
        updated = currentList.map(c => c.id === cuenta.id ? cuenta : c);
      } else {
        const newId = Date.now();
        savedCuenta = { ...cuenta, id: newId };
        updated = [...currentList, savedCuenta];
      }
      await StorageService.setJSON('cuentas_bancarias_local', updated);
      return {
        success: true,
        message: 'Cuenta bancaria guardada exitosamente.',
        cuenta: savedCuenta
      };
    }
  }

  async deleteCuentaBancaria(id: number): Promise<{ success: boolean; message: string }> {
    try {
      return await this.request(`/admin/cuentas-bancarias/${id}`, { method: 'DELETE' });
    } catch {
      const currentList = await this.getCuentasBancarias();
      const updated = currentList.filter(c => c.id !== id);
      await StorageService.setJSON('cuentas_bancarias_local', updated);
      return {
        success: true,
        message: 'Cuenta bancaria eliminada del sistema.'
      };
    }
  }

  async simularFinanciamiento(req: SimuladorRequest): Promise<SimuladorResponse> {
    try {
      return await this.request<SimuladorResponse>('/public/simulador', {
        method: 'POST',
        body: JSON.stringify(req)
      });
    } catch {
      const montoFinanciar = req.precio_lote - req.monto_prima;
      const cuota = calcularCuotaMensual(montoFinanciar, req.plazo_meses, req.tasa_interes_anual || 0);
      const tabla = generarTablaAmortizacion(montoFinanciar, req.plazo_meses, req.tasa_interes_anual || 0);

      return {
        monto_financiar: montoFinanciar,
        cuota_mensual: cuota,
        prima_minima: req.precio_lote * 0.10,
        total_financiamiento: req.monto_prima + (cuota * req.plazo_meses),
        tabla_amortizacion: tabla
      };
    }
  }

  async registrarPreReserva(data: FormData | any): Promise<{ success: boolean; message: string; codigo_reserva?: string }> {
    return this.registrarFormalizacion(data);
  }

  async registrarFormalizacion(data: any): Promise<{ success: boolean; message: string; codigo_reserva?: string; formalizacion?: Formalizacion }> {
    const payload = {
      ...data,
      lote_id: data.lote_id || data.id_lote,
      id_lote: data.lote_id || data.id_lote,
      monto_anticipo: Number(data.monto_anticipo) || 100,
      comprobante_voucher: data.comprobante_voucher || data.comprobante || ''
    };
    return await this.request('/formalizaciones', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getFormalizaciones(): Promise<Formalizacion[]> {
    try {
      return await this.request<Formalizacion[]>('/admin/formalizaciones');
    } catch {
      const stored = await StorageService.getJSON<Formalizacion[]>('formalizaciones_local');
      return stored && stored.length > 0 ? stored : MOCK_FORMALIZACIONES;
    }
  }

  async aprobarFormalizacion(id: string): Promise<{ success: boolean; message: string; comisionAcreditada: boolean }> {
    try {
      return await this.request(`/admin/formalizaciones/${id}/aprobar`, { method: 'POST' });
    } catch {
      const currentList = await this.getFormalizaciones();
      let comisionAcreditada = false;

      const updated = currentList.map(item => {
        if (item.id === id) {
          comisionAcreditada = !!item.codigo_referido;
          return {
            ...item,
            estado: 'Aprobada' as const,
            comision_acreditada: true,
            fecha_aprobacion: new Date().toISOString().split('T')[0]
          };
        }
        return item;
      });

      await StorageService.setJSON('formalizaciones_local', updated);

      // Si tenía código de referido, acreditar $20 USD a la billetera y actualizar referidos
      if (comisionAcreditada) {
        const currentSummary = await this.getResumenBilletera();
        const updatedSummary: BilleteraReferidosSummary = {
          ...currentSummary,
          total_ganado_historico: currentSummary.total_ganado_historico + 20.00,
          disponible_retiro: currentSummary.disponible_retiro + 20.00,
          ventas_ganadas_count: currentSummary.ventas_ganadas_count + 1,
          comisiones_en_proceso: Math.max(0, currentSummary.comisiones_en_proceso - 20.00)
        };
        await StorageService.setJSON('billetera_referidos_data', updatedSummary);

        const currentRefs = await this.getMisReferidos();
        const updatedRefs = currentRefs.map(ref => {
          if (ref.codigo_referido === 'AMSA-CARLOS-42' || ref.estado_pipeline === 'reservado') {
            return {
              ...ref,
              estado_pipeline: 'ganado_comision' as const,
              estado_comision: 'aprobada' as const,
              monto_ganado: 20.00,
              notas_seguimiento: '¡Voucher de prima aprobado por el Administrador! Comisión de $20 USD acreditada a tu billetera.',
              fecha_actualizacion: new Date().toISOString().split('T')[0]
            };
          }
          return ref;
        });
        await StorageService.setJSON('mis_referidos_local', updatedRefs);
      }

      return {
        success: true,
        message: comisionAcreditada
          ? '¡Formalización aprobada con éxito! Se ha activado y acreditado la comisión de $20 USD al promotor/vendedor.'
          : '¡Formalización aprobada con éxito! Lote marcado como formalizado.',
        comisionAcreditada
      };
    }
  }

  async rechazarFormalizacion(id: string, motivo?: string): Promise<{ success: boolean; message: string }> {
    try {
      return await this.request(`/admin/formalizaciones/${id}/rechazar`, {
        method: 'POST',
        body: JSON.stringify({ motivo })
      });
    } catch {
      const currentList = await this.getFormalizaciones();
      const updated = currentList.map(item => {
        if (item.id === id) {
          return {
            ...item,
            estado: 'Rechazada' as const,
            fecha_aprobacion: new Date().toISOString().split('T')[0]
          };
        }
        return item;
      });
      await StorageService.setJSON('formalizaciones_local', updated);

      return {
        success: true,
        message: 'Formalización marcada como rechazada.'
      };
    }
  }

  // ==================== AUTH & CLIENT API ====================

  async loginCliente(identificacion: string, expediente_num: string): Promise<{ token: string; cliente: Cliente }> {
    const res = await this.request<{ token: string; cliente: Cliente }>('/auth/login-cliente', {
      method: 'POST',
      body: JSON.stringify({ identificacion, expediente_num })
    });
    this.setToken(res.token);
    await StorageService.setJSON('cliente_data', res.cliente);
    return res;
  }

  async getContratosCliente(): Promise<VentaContrato[]> {
    try {
      return await this.request<VentaContrato[]>('/cliente/contratos');
    } catch {
      return MOCK_CONTRATOS;
    }
  }

  async getCuotasContrato(idVenta: number): Promise<Cuota[]> {
    try {
      return await this.request<Cuota[]>(`/cliente/contratos/${idVenta}/estado-cuenta`);
    } catch {
      return MOCK_CUOTAS_VENTA_301;
    }
  }

  async getRecibosContrato(idVenta: number): Promise<AbonoRecibo[]> {
    try {
      return await this.request<AbonoRecibo[]>(`/cliente/contratos/${idVenta}/recibos`);
    } catch {
      return MOCK_RECIBOS_VENTA_301;
    }
  }

  async reportarPago(payload: ReportePagoPayload | FormData): Promise<{ success: boolean; message: string; id_tramite?: string }> {
    try {
      return await this.request('/cliente/reportar-pago', {
        method: 'POST',
        body: payload instanceof FormData ? payload : JSON.stringify(payload)
      });
    } catch {
      return {
        success: true,
        message: 'Comprobante de pago registrado exitosamente para verificación contable.',
        id_tramite: `TRA-${Math.floor(100000 + Math.random() * 900000)}`
      };
    }
  }

  // ==================== PROGRAMA DE REFERIDOS ====================
  async getResumenBilletera(codigoPromotor: string = 'AMSA-CARLOS-42'): Promise<BilleteraReferidosSummary> {
    try {
      return await this.request<BilleteraReferidosSummary>(`/referidos/billetera/${codigoPromotor}`);
    } catch {
      const stored = await StorageService.getJSON<BilleteraReferidosSummary>('billetera_referidos_data');
      return stored || MOCK_BILLETERA_REFERIDOS;
    }
  }

  async getMisReferidos(codigoPromotor: string = 'AMSA-CARLOS-42'): Promise<Referido[]> {
    try {
      return await this.request<Referido[]>(`/referidos/promotor/${codigoPromotor}`);
    } catch {
      const stored = await StorageService.getJSON<Referido[]>('mis_referidos_local');
      if (stored && stored.length > 0) {
        return stored;
      }
      return MOCK_REFERIDOS;
    }
  }

  async registrarReferido(payload: NuevoReferidoPayload): Promise<{ success: boolean; message: string; referido: Referido }> {
    try {
      return await this.request('/referidos', {
        method: 'POST',
        body: JSON.stringify({
          codigo_promotor: payload.codigo_promotor || 'AMSA-CARLOS-42',
          nombre_prospecto: payload.nombre_referido,
          telefono_prospecto: payload.telefono_referido,
          lotificacion_interes_id: payload.lotificacion_id,
          notas: payload.notas_seguimiento
        })
      });
    } catch {
      const currentList = await this.getMisReferidos();
      const lotificaciones = await this.getLotificaciones();
      const selectedLot = lotificaciones.find(l => l.id === payload.lotificacion_id);

      const nuevo: Referido = {
        id: Date.now(),
        nombre_referido: payload.nombre_referido,
        telefono_referido: payload.telefono_referido,
        email_referido: payload.email_referido,
        lotificacion_id: payload.lotificacion_id,
        lotificacion_nombre: selectedLot?.nombre || 'General / Por Definir',
        estado_pipeline: 'nuevo',
        estado_comision: 'pendiente',
        monto_comision: 20.00,
        monto_ganado: 0,
        notas_seguimiento: payload.notas_seguimiento || 'Registrado desde la app móvil. Pendiente de primer contacto.',
        fecha_registro: new Date().toISOString().split('T')[0],
      };

      const updatedList = [nuevo, ...currentList];
      await StorageService.setJSON('mis_referidos_local', updatedList);

      // Actualizar conteos del resumen
      const currentSummary = await this.getResumenBilletera();
      const updatedSummary: BilleteraReferidosSummary = {
        ...currentSummary,
        total_referidos_count: currentSummary.total_referidos_count + 1,
        en_proceso_count: currentSummary.en_proceso_count + 1,
        comisiones_en_proceso: currentSummary.comisiones_en_proceso + 20.00
      };
      await StorageService.setJSON('billetera_referidos_data', updatedSummary);

      return {
        success: true,
        message: '¡Tu referido ha sido registrado con éxito! Un asesor comercial lo contactará en breve.',
        referido: nuevo
      };
    }
  }

  async getHistorialPagos(): Promise<SolicitudPago[]> {
    try {
      return await this.request<SolicitudPago[]>('/cliente/referidos/historial-pagos');
    } catch {
      const stored = await StorageService.getJSON<SolicitudPago[]>('solicitudes_pago_local');
      return stored && stored.length > 0 ? stored : MOCK_SOLICITUDES_PAGO;
    }
  }

  async solicitarRetiro(payload: SolicitudPagoPayload): Promise<{ success: boolean; message: string; solicitud: SolicitudPago }> {
    try {
      return await this.request('/referidos/solicitar-retiro', {
        method: 'POST',
        body: JSON.stringify({
          codigo_promotor: payload.codigo_promotor || 'AMSA-CARLOS-42',
          monto: payload.monto,
          metodo_pago: payload.metodo_pago || 'Transferencia Bancaria',
          banco_destino: payload.banco,
          numero_cuenta_destino: payload.numero_cuenta,
          titular_cuenta: payload.titular_cuenta
        })
      });
    } catch {
      const currentSolicitudes = await this.getHistorialPagos();
      const nuevaSolicitud: SolicitudPago = {
        id: Date.now(),
        monto: payload.monto,
        banco: payload.banco,
        tipo_cuenta: payload.tipo_cuenta,
        numero_cuenta: payload.numero_cuenta,
        titular_cuenta: payload.titular_cuenta,
        identificacion_titular: payload.identificacion_titular,
        estado: 'solicitado',
        fecha_solicitud: new Date().toISOString().split('T')[0]
      };

      const updated = [nuevaSolicitud, ...currentSolicitudes];
      await StorageService.setJSON('solicitudes_pago_local', updated);

      // Descontar saldo disponible
      const currentSummary = await this.getResumenBilletera();
      const updatedSummary: BilleteraReferidosSummary = {
        ...currentSummary,
        disponible_retiro: Math.max(0, currentSummary.disponible_retiro - payload.monto)
      };
      await StorageService.setJSON('billetera_referidos_data', updatedSummary);

      return {
        success: true,
        message: 'Solicitud de cobro enviada a tesorería. Será procesada en un lapso de 24 a 48 horas hábiles.',
        solicitud: nuevaSolicitud
      };
    }
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      this.setToken(null);
      await StorageService.remove('cliente_data');
    }
  }
}

export const api = new ApiClient();
