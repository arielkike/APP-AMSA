import { 
  Lotificacion, 
  Bloque, 
  Lote, 
  Cliente, 
  VentaContrato, 
  Cuota, 
  AbonoRecibo, 
  CuentaBancaria,
  Referido,
  BilleteraReferidosSummary,
  SolicitudPago,
  Formalizacion
} from '../types/models';

export const MOCK_LOTIFICACIONES: Lotificacion[] = [
  {
    id: 1,
    nombre: 'Lotificación La Campana',
    ubicacion: 'Sébaco, Matagalpa - Km 104 Carretera Panamericana Norte',
    descripcion: 'Urbanización exclusiva con acceso pavimentado, alumbrado público, agua potable y amplias áreas verdes recreativas.',
    estado: 'Activo',
    imagen_principal: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    galeria: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
    ],
    coordenadas: {
      lat: 12.8531,
      lng: -85.9811
    },
    amenidades: ['Agua Potable 24/7', 'Energía Eléctrica', 'Calles Adoquinadas', 'Parque Infantil', 'Fácil Acceso'],
    total_lotes: 120,
    lotes_disponibles: 34,
    precio_desde: 8500
  },
  {
    id: 2,
    nombre: 'Colinas Santa Clara',
    ubicacion: 'Matagalpa - Salida a Jinotega, Sector Santa Clara',
    descripcion: 'Hermoso clima fresco de montaña, vista panorámica al valle y excelente plusvalía para vivienda familiar o inversión.',
    estado: 'Activo',
    imagen_principal: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=80',
    galeria: [
      'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80'
    ],
    coordenadas: {
      lat: 12.9258,
      lng: -85.9189
    },
    amenidades: ['Clima Fresco', 'Seguridad Privada', 'Senderos Ecológicos', 'Transporte Colectivo'],
    total_lotes: 95,
    lotes_disponibles: 18,
    precio_desde: 11000
  },
  {
    id: 3,
    nombre: 'Colinas de Chaguitillo',
    ubicacion: 'Chaguitillo, Valle de Sébaco',
    descripcion: 'Terrenos 100% planos ideales para construcción inmediata. Financiamiento directo hasta 72 meses.',
    estado: 'Activo',
    imagen_principal: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    galeria: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'
    ],
    coordenadas: {
      lat: 12.8752,
      lng: -86.0124
    },
    amenidades: ['Terreno Plano', 'Pozo Propio', 'Documentación al Día', 'Luz Eléctrica'],
    total_lotes: 80,
    lotes_disponibles: 22,
    precio_desde: 7800
  },
  {
    id: 4,
    nombre: 'Bellas Rosas',
    ubicacion: 'San Isidro, Matagalpa',
    descripcion: 'Proyecto residencial en desarrollo con alta proyección turística y residencial.',
    estado: 'Activo',
    imagen_principal: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    amenidades: ['Área Comercial', 'Cerca Perimetral', 'Áreas Deportivas'],
    total_lotes: 60,
    lotes_disponibles: 12,
    precio_desde: 9200
  }
];

export const MOCK_BLOQUES: Bloque[] = [
  { id_bloque: 1, lotificacion_id: 1, nombre: 'Bloque A', lotes_count: 10 },
  { id_bloque: 2, lotificacion_id: 1, nombre: 'Bloque B', lotes_count: 10 },
  { id_bloque: 3, lotificacion_id: 1, nombre: 'Bloque K', lotes_count: 12 },
  { id_bloque: 4, lotificacion_id: 2, nombre: 'Bloque 1', lotes_count: 8 },
  { id_bloque: 5, lotificacion_id: 2, nombre: 'Bloque 2', lotes_count: 8 }
];

export const MOCK_LOTES: Lote[] = [
  {
    id_lote: 101,
    id_bloque: 1,
    nombre_bloque: 'Bloque A',
    lotificacion_id: 1,
    lotificacion_nombre: 'Lotificación La Campana',
    numero_lote: 'A-01',
    area_metros: 250.00,
    area_varas: 354.60,
    precio_base: 9500.00,
    precio_vara: 26.79,
    estado: 'Disponible',
    medidas: { norte: '10m', sur: '10m', este: '25m', oeste: '25m' }
  },
  {
    id_lote: 102,
    id_bloque: 1,
    nombre_bloque: 'Bloque A',
    lotificacion_id: 1,
    lotificacion_nombre: 'Lotificación La Campana',
    numero_lote: 'A-02',
    area_metros: 250.00,
    area_varas: 354.60,
    precio_base: 9500.00,
    precio_vara: 26.79,
    estado: 'Disponible',
    medidas: { norte: '10m', sur: '10m', este: '25m', oeste: '25m' }
  },
  {
    id_lote: 103,
    id_bloque: 1,
    nombre_bloque: 'Bloque A',
    lotificacion_id: 1,
    lotificacion_nombre: 'Lotificación La Campana',
    numero_lote: 'A-03',
    area_metros: 300.00,
    area_varas: 425.52,
    precio_base: 11400.00,
    precio_vara: 26.79,
    estado: 'Reservado',
    medidas: { norte: '12m', sur: '12m', este: '25m', oeste: '25m' }
  },
  {
    id_lote: 104,
    id_bloque: 1,
    nombre_bloque: 'Bloque A',
    lotificacion_id: 1,
    lotificacion_nombre: 'Lotificación La Campana',
    numero_lote: 'A-04',
    area_metros: 250.00,
    area_varas: 354.60,
    precio_base: 9500.00,
    precio_vara: 26.79,
    estado: 'Vendido',
    medidas: { norte: '10m', sur: '10m', este: '25m', oeste: '25m' }
  },
  {
    id_lote: 105,
    id_bloque: 3,
    nombre_bloque: 'Bloque K',
    lotificacion_id: 1,
    lotificacion_nombre: 'Lotificación La Campana',
    numero_lote: 'K-34',
    area_metros: 280.00,
    area_varas: 397.16,
    precio_base: 10800.00,
    precio_vara: 27.19,
    estado: 'Disponible',
    medidas: { norte: '10m', sur: '10m', este: '28m', oeste: '28m' }
  },
  {
    id_lote: 106,
    id_bloque: 3,
    nombre_bloque: 'Bloque K',
    lotificacion_id: 1,
    lotificacion_nombre: 'Lotificación La Campana',
    numero_lote: 'K-35',
    area_metros: 350.00,
    area_varas: 496.45,
    precio_base: 13500.00,
    precio_vara: 27.19,
    estado: 'Disponible',
    medidas: { norte: '14m', sur: '14m', este: '25m', oeste: '25m' }
  },
  {
    id_lote: 201,
    id_bloque: 4,
    nombre_bloque: 'Bloque 1',
    lotificacion_id: 2,
    lotificacion_nombre: 'Colinas Santa Clara',
    numero_lote: 'L-01',
    area_metros: 320.00,
    area_varas: 453.89,
    precio_base: 12800.00,
    precio_vara: 28.20,
    estado: 'Disponible',
    medidas: { norte: '12m', sur: '12m', este: '26.6m', oeste: '26.6m' }
  },
  {
    id_lote: 202,
    id_bloque: 4,
    nombre_bloque: 'Bloque 1',
    lotificacion_id: 2,
    lotificacion_nombre: 'Colinas Santa Clara',
    numero_lote: 'L-02',
    area_metros: 300.00,
    area_varas: 425.52,
    precio_base: 11900.00,
    precio_vara: 28.20,
    estado: 'Disponible',
    medidas: { norte: '12m', sur: '12m', este: '25m', oeste: '25m' }
  },
  {
    id_lote: 301,
    id_bloque: 5,
    nombre_bloque: 'Bloque Central',
    lotificacion_id: 3,
    lotificacion_nombre: 'Colinas de Chaguitillo',
    numero_lote: 'C-01',
    area_metros: 260.00,
    area_varas: 368.79,
    precio_base: 7800.00,
    precio_vara: 21.15,
    estado: 'Disponible',
    medidas: { norte: '10m', sur: '10m', este: '26m', oeste: '26m' }
  },
  {
    id_lote: 302,
    id_bloque: 5,
    nombre_bloque: 'Bloque Central',
    lotificacion_id: 3,
    lotificacion_nombre: 'Colinas de Chaguitillo',
    numero_lote: 'C-02',
    area_metros: 280.00,
    area_varas: 397.16,
    precio_base: 8400.00,
    precio_vara: 21.15,
    estado: 'Disponible',
    medidas: { norte: '10m', sur: '10m', este: '28m', oeste: '28m' }
  },
  {
    id_lote: 401,
    id_bloque: 6,
    nombre_bloque: 'Bloque Rosas 1',
    lotificacion_id: 4,
    lotificacion_nombre: 'Bellas Rosas',
    numero_lote: 'R-01',
    area_metros: 300.00,
    area_varas: 425.52,
    precio_base: 9200.00,
    precio_vara: 21.62,
    estado: 'Disponible',
    medidas: { norte: '12m', sur: '12m', este: '25m', oeste: '25m' }
  }
];

export const MOCK_CUENTAS_BANCARIAS: CuentaBancaria[] = [
  {
    id: 1,
    banco: 'BAC Credomatic',
    numero_cuenta: '365-894120-1',
    tipo_cuenta: 'Corriente',
    moneda: 'USD',
    titular: 'PROYECTOS SAN MIGUEL S.A.'
  },
  {
    id: 2,
    banco: 'BAC Credomatic',
    numero_cuenta: '365-894125-9',
    tipo_cuenta: 'Corriente',
    moneda: 'NIO',
    titular: 'PROYECTOS SAN MIGUEL S.A.'
  },
  {
    id: 3,
    banco: 'Banco LAFISE Bancentro',
    numero_cuenta: '109-245890-0',
    tipo_cuenta: 'Ahorro',
    moneda: 'USD',
    titular: 'PROYECTOS SAN MIGUEL S.A.'
  },
  {
    id: 4,
    banco: 'Banpro Grupo Promerica',
    numero_cuenta: '100-203948-3',
    tipo_cuenta: 'Corriente',
    moneda: 'USD',
    titular: 'PROYECTOS SAN MIGUEL S.A.'
  }
];

export const MOCK_CLIENTE: Cliente = {
  id_cliente: 42,
  expediente_num: 'EXP-0202-1',
  pv_num: 'PV-2024-88',
  nombres_apellidos: 'Carlos Alberto Mendoza Rivas',
  identificacion: '441-150885-0002F',
  telefono: '+505 8899-7711',
  email: 'carlos.mendoza@email.com',
  direccion: 'Matagalpa, Barrio Guanuca de la iglesia 2c al norte',
  token_seguimiento: 'uuid-tok-998812'
};

export const MOCK_CONTRATOS: VentaContrato[] = [
  {
    id_venta: 301,
    id_cliente: 42,
    lotificacion_id: 1,
    lotificacion_nombre: 'Lotificación La Campana',
    lote_identificador: 'Lote K-34 (Bloque K)',
    fecha_venta: '2024-03-15',
    precio_final: 10800.00,
    prima_pagada: 1200.00,
    plazo_meses: 60,
    cuota_mensual: 160.00,
    estado_contrato: 'Vigente',
    beneficiario_final: 'María Elena Rivas (Madre)',
    nota_beneficiario: 'En caso de imprevisto el traspaso se gestionará a su favor',
    total_abonado: 4080.00,
    saldo_restante: 6720.00,
    cuotas_pagadas_count: 18,
    cuotas_pendientes_count: 42,
    cuotas_mora_count: 0,
    proxima_cuota_vencimiento: '2026-10-15',
    proxima_cuota_monto: 160.00,
    dias_mora: 0,
    estado_pago: 'Al Día'
  },
  {
    id_venta: 302,
    id_cliente: 42,
    lotificacion_id: 2,
    lotificacion_nombre: 'Colinas Santa Clara',
    lote_identificador: 'Lote L-08 (Bloque 2)',
    fecha_venta: '2025-01-10',
    precio_final: 12500.00,
    prima_pagada: 1500.00,
    plazo_meses: 72,
    cuota_mensual: 152.78,
    estado_contrato: 'Vigente',
    beneficiario_final: 'Carlos Mendoza Jr.',
    total_abonado: 2722.24,
    saldo_restante: 9777.76,
    cuotas_pagadas_count: 8,
    cuotas_pendientes_count: 64,
    cuotas_mora_count: 0,
    proxima_cuota_vencimiento: '2026-10-10',
    proxima_cuota_monto: 152.78,
    dias_mora: 0,
    estado_pago: 'Al Día'
  }
];

export const MOCK_CUOTAS_VENTA_301: Cuota[] = Array.from({ length: 60 }).map((_, index) => {
  const num = index + 1;
  const isPaid = num <= 18;
  const isNext = num === 19;
  
  // Fechas mensuales a partir de 2024-04-15
  const baseDate = new Date(2024, 3, 15);
  baseDate.setMonth(baseDate.getMonth() + index);
  const dateStr = baseDate.toISOString().split('T')[0];

  return {
    id_cuota: 1000 + num,
    id_venta: 301,
    numero_cuota: num,
    fecha_vencimiento: dateStr,
    monto_total: 160.00,
    capital: 160.00,
    saldo_restante: Math.max(0, 9600 - (num * 160)),
    mora_pendiente: 0,
    estado: isPaid ? 'Pagada' : isNext ? 'Pendiente' : 'Pendiente',
    fecha_pago_real: isPaid ? dateStr : undefined
  };
});

export const MOCK_RECIBOS_VENTA_301: AbonoRecibo[] = [
  {
    id_abono: 501,
    id_venta: 301,
    numero_recibo: 'REC-2024-00124',
    codigo_recibo: 'RC-9901',
    fecha_pago: '2024-03-15',
    monto_abonado: 1200.00,
    tipo_pago: 'Prima/Primer Abono',
    metodo_pago: 'Transferencia Bancaria',
    referencia: 'BAC-TRF-902834',
    cuenta_destino: 'BAC Credomatic USD',
    recibo_firmado: true
  },
  {
    id_abono: 502,
    id_venta: 301,
    numero_recibo: 'REC-2024-00382',
    codigo_recibo: 'RC-9988',
    fecha_pago: '2024-04-14',
    monto_abonado: 160.00,
    tipo_pago: 'Cuota Mensual (Cuota #1)',
    metodo_pago: 'Depósito Bancario',
    referencia: 'DEP-LAFISE-1122',
    cuenta_destino: 'BAC Credomatic USD',
    recibo_firmado: true
  },
  {
    id_abono: 503,
    id_venta: 301,
    numero_recibo: 'REC-2024-00719',
    codigo_recibo: 'RC-10452',
    fecha_pago: '2024-05-15',
    monto_abonado: 160.00,
    tipo_pago: 'Cuota Mensual (Cuota #2)',
    metodo_pago: 'Transferencia Bancaria',
    referencia: 'BAC-TRF-987654',
    cuenta_destino: 'BAC Credomatic USD',
    recibo_firmado: true
  },
  {
    id_abono: 504,
    id_venta: 301,
    numero_recibo: 'REC-2026-04981',
    codigo_recibo: 'RC-18302',
    fecha_pago: '2026-09-14',
    monto_abonado: 160.00,
    tipo_pago: 'Cuota Mensual (Cuota #18)',
    metodo_pago: 'Transferencia Bancaria',
    referencia: 'BAC-TRF-445566',
    cuenta_destino: 'BAC Credomatic USD',
    recibo_firmado: true
  }
];

// ==================== MOCK PROGRAMA REFERIDOS ====================

export const MOCK_BILLETERA_REFERIDOS: BilleteraReferidosSummary = {
  total_ganado_historico: 60.00,
  disponible_retiro: 40.00,
  comisiones_en_proceso: 20.00,
  total_referidos_count: 5,
  ventas_ganadas_count: 3,
  en_proceso_count: 2,
  comision_base_por_lote: 20.00,
  codigo_promotor_personal: 'AMSA-CARLOS-42',
  enlace_compartir: 'https://proyectosanmiguel.com/app?ref=AMSA-CARLOS-42',
  nivel_embajador: 'Plata'
};

export const MOCK_REFERIDOS: Referido[] = [
  {
    id: 901,
    promotor_id: 42,
    promotor_nombre: 'Carlos Alberto Mendoza Rivas',
    promotor_telefono: '+505 8899-7711',
    codigo_referido: 'AMSA-CARLOS-42',
    nombre_referido: 'Lic. Fernando Gutiérrez',
    telefono_referido: '+505 8444-1234',
    email_referido: 'fernando.gtz@gmail.com',
    lotificacion_id: 1,
    lotificacion_nombre: 'Lotificación La Campana',
    lote_interes: 'Lote K-12',
    estado_pipeline: 'ganado_comision',
    estado_comision: 'aprobada',
    monto_comision: 20.00,
    monto_ganado: 20.00,
    notas_seguimiento: 'Formalización de prima aprobada por administración. Comisión de $20 acreditada.',
    fecha_registro: '2026-08-10',
    fecha_actualizacion: '2026-09-02'
  },
  {
    id: 902,
    promotor_id: 42,
    promotor_nombre: 'Carlos Alberto Mendoza Rivas',
    promotor_telefono: '+505 8899-7711',
    codigo_referido: 'AMSA-CARLOS-42',
    nombre_referido: 'Dra. Patricia Zamora',
    telefono_referido: '+505 8765-4321',
    email_referido: 'dra.zamora@outlook.com',
    lotificacion_id: 2,
    lotificacion_nombre: 'Colinas Santa Clara',
    lote_interes: 'Lote B-05',
    estado_pipeline: 'ganado_comision',
    estado_comision: 'aprobada',
    monto_comision: 20.00,
    monto_ganado: 20.00,
    notas_seguimiento: 'Prima formalizada con voucher BAC. Comisión de $20 acreditada.',
    fecha_registro: '2026-08-28',
    fecha_actualizacion: '2026-09-20'
  },
  {
    id: 903,
    promotor_id: 42,
    promotor_nombre: 'Carlos Alberto Mendoza Rivas',
    promotor_telefono: '+505 8899-7711',
    codigo_referido: 'AMSA-CARLOS-42',
    nombre_referido: 'Ing. Marvin Blandón',
    telefono_referido: '+505 8234-5678',
    lotificacion_id: 1,
    lotificacion_nombre: 'Lotificación La Campana',
    lote_interes: 'Lote A-08',
    estado_pipeline: 'reservado',
    estado_comision: 'pendiente',
    monto_comision: 20.00,
    monto_ganado: 0,
    notas_seguimiento: 'Subió voucher de prima/formalización por $100 USD. Pendiente de aprobación por admin.',
    fecha_registro: '2026-09-25',
    fecha_actualizacion: '2026-10-01'
  },
  {
    id: 904,
    promotor_id: 42,
    promotor_nombre: 'Carlos Alberto Mendoza Rivas',
    promotor_telefono: '+505 8899-7711',
    codigo_referido: 'AMSA-CARLOS-42',
    nombre_referido: 'Sra. Miriam Rostrán',
    telefono_referido: '+505 8912-3456',
    lotificacion_id: 3,
    lotificacion_nombre: 'Colinas de Chaguitillo',
    estado_pipeline: 'visita_agendada',
    estado_comision: 'pendiente',
    monto_comision: 20.00,
    monto_ganado: 0,
    notas_seguimiento: 'Cita en terreno programada para el sábado 10:00 AM con Asesor comercial.',
    fecha_registro: '2026-10-02',
    fecha_actualizacion: '2026-10-03'
  },
  {
    id: 905,
    promotor_id: 42,
    promotor_nombre: 'Carlos Alberto Mendoza Rivas',
    promotor_telefono: '+505 8899-7711',
    codigo_referido: 'AMSA-CARLOS-42',
    nombre_referido: 'Prof. Roberto Castro',
    telefono_referido: '+505 8111-2233',
    lotificacion_id: 1,
    lotificacion_nombre: 'Lotificación La Campana',
    estado_pipeline: 'ganado_comision',
    estado_comision: 'pagada',
    monto_comision: 20.00,
    monto_ganado: 20.00,
    notas_seguimiento: 'Comisión pagada por transferencia BAC el 15 de Julio 2026.',
    fecha_registro: '2026-06-12',
    fecha_actualizacion: '2026-07-15'
  }
];

export const MOCK_SOLICITUDES_PAGO: SolicitudPago[] = [
  {
    id: 701,
    monto: 20.00,
    banco: 'BAC Credomatic',
    tipo_cuenta: 'Ahorro',
    numero_cuenta: '365-992812-4',
    titular_cuenta: 'Carlos Alberto Mendoza Rivas',
    identificacion_titular: '441-150885-0002F',
    estado: 'transferido',
    fecha_solicitud: '2026-07-14',
    fecha_pago: '2026-07-15',
    numero_referencia_bancaria: 'BAC-REF-098812',
    comprobante_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80'
  }
];

export const MOCK_FORMALIZACIONES: Formalizacion[] = [
  {
    id: 'FOR-2026-881',
    lotificacion_id: 1,
    lotificacion_nombre: 'Lotificación La Campana',
    id_lote: 101,
    lote_identificador: 'Lote A-01 (Bloque A)',
    nombres_apellidos: 'Ing. Marvin Blandón',
    identificacion: '441-200490-0003K',
    telefono: '+505 8234-5678',
    direccion: 'Sébaco, Barrio San Antonio',
    cuenta_bancaria_id: 1,
    cuenta_bancaria_nombre: 'BAC Credomatic USD (365-894120-1)',
    monto_anticipo: 100.00,
    referencia_bancaria: 'BAC-TRF-778899',
    comprobante_voucher: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    codigo_referido: 'AMSA-CARLOS-42',
    promotor_nombre: 'Carlos Alberto Mendoza Rivas',
    estado: 'Pendiente',
    comision_acreditada: false,
    monto_comision: 20.00,
    fecha_registro: '2026-10-03'
  },
  {
    id: 'FOR-2026-880',
    lotificacion_id: 2,
    lotificacion_nombre: 'Colinas Santa Clara',
    id_lote: 201,
    lote_identificador: 'Lote L-01 (Bloque 1)',
    nombres_apellidos: 'Dra. Patricia Zamora',
    identificacion: '441-110287-0001B',
    telefono: '+505 8765-4321',
    direccion: 'Matagalpa, El Molino',
    cuenta_bancaria_id: 1,
    cuenta_bancaria_nombre: 'BAC Credomatic USD (365-894120-1)',
    monto_anticipo: 150.00,
    referencia_bancaria: 'DEP-LAFISE-9912',
    comprobante_voucher: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    codigo_referido: 'AMSA-CARLOS-42',
    promotor_nombre: 'Carlos Alberto Mendoza Rivas',
    estado: 'Aprobada',
    comision_acreditada: true,
    monto_comision: 20.00,
    fecha_registro: '2026-09-20',
    fecha_aprobacion: '2026-09-21'
  }
];


