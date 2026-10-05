export type LoteEstado = 'Disponible' | 'Reservado' | 'Vendido';
export type ContratoEstado = 'Vigente' | 'Finalizado' | 'Rescindido';
export type CuotaEstado = 'Pagada' | 'Pendiente' | 'Mora' | 'Parcial';
export type MetodoPago = 'Efectivo' | 'Transferencia Bancaria' | 'Depósito Bancario';

export interface Lotificacion {
  id: number;
  nombre: string;
  ubicacion: string;
  descripcion?: string;
  estado: string;
  imagen_principal?: string;
  galeria?: string[];
  coordenadas?: {
    lat: number;
    lng: number;
  };
  amenidades?: string[];
  total_lotes?: number;
  lotes_disponibles?: number;
  precio_desde?: number;
  created_at?: string;
}

export interface Bloque {
  id_bloque: number;
  lotificacion_id: number;
  nombre: string;
  lotes_count?: number;
}

export interface Lote {
  id_lote: number;
  id_bloque: number;
  nombre_bloque?: string;
  lotificacion_id?: number;
  lotificacion_nombre?: string;
  numero_lote: string;
  area_metros: number;
  area_varas?: number;
  precio_base: number;
  precio_vara?: number;
  estado: LoteEstado;
  medidas?: {
    norte?: string;
    sur?: string;
    este?: string;
    oeste?: string;
  };
}

export interface Cliente {
  id_cliente: number;
  expediente_num: string;
  pv_num?: string;
  nombres_apellidos: string;
  identificacion: string;
  telefono: string;
  email?: string;
  direccion: string;
  token_seguimiento?: string;
}

export interface VentaContrato {
  id_venta: number;
  id_cliente: number;
  cliente?: Cliente;
  lotificacion_id: number;
  lotificacion_nombre?: string;
  lote_identificador?: string; // ej. "Lote K-34"
  fecha_venta: string;
  precio_final: number;
  prima_pagada?: number;
  plazo_meses: number;
  cuota_mensual: number;
  estado_contrato: ContratoEstado;
  beneficiario_final?: string;
  nota_beneficiario?: string;
  
  // Totales calculados
  total_abonado?: number;
  saldo_restante?: number;
  cuotas_pagadas_count?: number;
  cuotas_pendientes_count?: number;
  cuotas_mora_count?: number;
  proxima_cuota_vencimiento?: string;
  proxima_cuota_monto?: number;
  dias_mora?: number;
  estado_pago?: 'Al Día' | 'En Mora' | 'Completado';
}

export interface Cuota {
  id_cuota: number;
  id_venta: number;
  numero_cuota: number;
  fecha_vencimiento: string;
  monto_total: number;
  capital: number;
  saldo_restante: number;
  mora_pendiente: number;
  estado: CuotaEstado;
  dias_retraso?: number;
  fecha_pago_real?: string;
}

export interface AbonoRecibo {
  id_abono: number;
  id_venta: number;
  numero_recibo: string;
  codigo_recibo: string;
  fecha_pago: string;
  fecha_transferencia?: string;
  monto_abonado: number;
  tipo_pago: string; // "Cuota Mensual" | "Prima/Primer Abono" | "Abono a Capital"
  metodo_pago: MetodoPago;
  referencia?: string;
  cuenta_destino?: string;
  ruta_recibo?: string;
  recibo_firmado?: boolean;
}

export interface CuentaBancaria {
  id: number;
  banco: string;
  numero_cuenta: string;
  tipo_cuenta: string; // "Corriente" | "Ahorro"
  moneda: string; // "USD" | "NIO"
  titular: string;
  logo_url?: string;
}

export interface Reserva {
  id_reserva: number;
  id_cliente: number;
  lotificacion_id: number;
  id_lote: number;
  fecha_reserva: string;
  monto_reserva: number;
  estado: 'Activa' | 'Formalizada' | 'Cancelada';
}

export interface Formalizacion {
  id: string;
  lotificacion_id: number;
  lotificacion_nombre?: string;
  id_lote: number;
  lote_identificador?: string;
  nombres_apellidos: string;
  identificacion: string;
  telefono: string;
  direccion?: string;
  cuenta_bancaria_id: number;
  cuenta_bancaria_nombre?: string;
  monto_anticipo: number;
  referencia_bancaria?: string;
  comprobante_voucher?: string;
  codigo_referido?: string;
  promotor_nombre?: string;
  estado: 'Pendiente' | 'Aprobada' | 'Rechazada';
  comision_acreditada: boolean;
  monto_comision: number; // $20.00 USD
  fecha_registro: string;
  fecha_aprobacion?: string;
}

export interface SimuladorRequest {
  precio_lote: number;
  monto_prima: number;
  plazo_meses: number;
  tasa_interes_anual?: number;
}

export interface AmortizacionCuota {
  mes: number;
  cuota: number;
  capital: number;
  interes: number;
  saldo: number;
}

export interface SimuladorResponse {
  monto_financiar: number;
  cuota_mensual: number;
  prima_minima: number;
  total_financiamiento: number;
  tabla_amortizacion: AmortizacionCuota[];
}

export interface ReportePagoPayload {
  id_venta: number;
  monto: number;
  fecha_transferencia: string;
  metodo_pago: MetodoPago;
  referencia: string;
  cuenta_destino: string;
  observaciones?: string;
  comprobante_base64?: string;
}

// ==================== PROGRAMA DE REFERIDOS ====================

export type ReferidoEstado = 
  | 'nuevo' 
  | 'contactado' 
  | 'visita_agendada' 
  | 'reservado' 
  | 'ganado_comision' 
  | 'no_interesado';

export type ComisionEstado = 
  | 'pendiente' 
  | 'aprobada' 
  | 'pagada' 
  | 'rechazada';

export interface Referido {
  id: number;
  promotor_id?: number;
  promotor_nombre?: string;
  promotor_telefono?: string;
  codigo_referido?: string;
  nombre_referido: string;
  telefono_referido: string;
  email_referido?: string;
  lotificacion_id?: number;
  lotificacion_nombre?: string;
  estado_pipeline: ReferidoEstado;
  estado_comision: ComisionEstado;
  monto_comision: number;
  monto_ganado?: number;
  notas_seguimiento?: string;
  fecha_registro: string;
  fecha_actualizacion?: string;
  lote_interes?: string;
}

export interface BilleteraReferidosSummary {
  total_ganado_historico: number;
  disponible_retiro: number;
  comisiones_en_proceso: number;
  total_referidos_count: number;
  ventas_ganadas_count: number;
  en_proceso_count: number;
  comision_base_por_lote: number;
  codigo_promotor_personal: string;
  enlace_compartir: string;
  nivel_embajador: 'Bronce' | 'Plata' | 'Oro' | 'Diamante';
}

export interface SolicitudPago {
  id: number;
  monto: number;
  banco: string;
  tipo_cuenta: 'Ahorro' | 'Corriente';
  numero_cuenta: string;
  titular_cuenta: string;
  identificacion_titular: string;
  estado: 'solicitado' | 'en_revision' | 'transferido' | 'rechazado';
  fecha_solicitud: string;
  fecha_pago?: string;
  numero_referencia_bancaria?: string;
  comprobante_url?: string;
}

export interface NuevoReferidoPayload {
  codigo_promotor?: string;
  nombre_referido: string;
  telefono_referido: string;
  email_referido?: string;
  lotificacion_id?: number;
  notas_seguimiento?: string;
}

export interface SolicitudPagoPayload {
  codigo_promotor?: string;
  monto: number;
  metodo_pago?: string;
  banco: string;
  tipo_cuenta: 'Ahorro' | 'Corriente';
  numero_cuenta: string;
  titular_cuenta: string;
  identificacion_titular: string;
}


