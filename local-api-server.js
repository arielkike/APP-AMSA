import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de MySQL local para 'app-amsa-db'
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'app-amsa-db',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const FACTOR_CONVERSION = 1.418415; // 1 m² = 1.418415 vrs²

// Test de conexión a la BD
async function testDb() {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS solution');
    console.log('✅ Conexión exitosa a la base de datos local [app-amsa-db]');
  } catch (err) {
    console.warn('⚠️ No se pudo conectar a MySQL local (Revisa que tu XAMPP/Laragon esté iniciado):', err.message);
  }
}
testDb();

// ==================== ENDPOINTS PÚBLICOS ====================

app.get('/api/v1/public/lotificaciones', async (req, res) => {
  try {
    const [lotificaciones] = await pool.query('SELECT * FROM lotificaciones');

    const result = await Promise.all(
      lotificaciones.map(async (item) => {
        const [totalRows] = await pool.query(
          'SELECT COUNT(*) as count FROM lotes JOIN bloques ON lotes.id_bloque = bloques.id_bloque WHERE bloques.lotificacion_id = ?',
          [item.id]
        );
        const [disponiblesRows] = await pool.query(
          'SELECT COUNT(*) as count FROM lotes JOIN bloques ON lotes.id_bloque = bloques.id_bloque WHERE bloques.lotificacion_id = ? AND lotes.estado = "Disponible"',
          [item.id]
        );
        const [minPrecioRows] = await pool.query(
          'SELECT MIN(precio_base) as min_p FROM lotes JOIN bloques ON lotes.id_bloque = bloques.id_bloque WHERE bloques.lotificacion_id = ? AND lotes.estado = "Disponible"',
          [item.id]
        );

        return {
          id: item.id,
          nombre: item.nombre,
          ubicacion: item.ubicacion || 'Sébaco, Matagalpa',
          descripcion: item.descripcion || 'Urbanización exclusiva con financiamiento directo.',
          estado: item.estado || 'Activo',
          imagen_principal: item.imagen_principal || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
          amenidades: ['Agua Potable', 'Energía Eléctrica', 'Calles Adoquinadas', 'Parque Infantil'],
          total_lotes: totalRows[0]?.count || 0,
          lotes_disponibles: disponiblesRows[0]?.count || 0,
          precio_desde: Number(minPrecioRows[0]?.min_p) || 8500,
        };
      })
    );

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/v1/public/lotificaciones/:id/lotes', async (req, res) => {
  try {
    const [lotes] = await pool.query(
      `SELECT lotes.id_lote, lotes.id_bloque, bloques.nombre as nombre_bloque, 
              lotificaciones.id as lotificacion_id, lotificaciones.nombre as lotificacion_nombre, 
              lotes.numero_lote, lotes.area_metros, lotes.precio_base, lotes.estado
       FROM lotes
       JOIN bloques ON lotes.id_bloque = bloques.id_bloque
       JOIN lotificaciones ON bloques.lotificacion_id = lotificaciones.id
       WHERE lotificaciones.id = ? AND lotes.estado IN ('Disponible', 'Reservado')`,
      [req.params.id]
    );

    const formatted = lotes.map((l) => {
      const areaM = Number(l.area_metros) || 0;
      const areaV = Number((areaM * FACTOR_CONVERSION).toFixed(2));
      const precioB = Number(l.precio_base) || 0;

      return {
        id_lote: l.id_lote,
        id_bloque: l.id_bloque,
        nombre_bloque: l.nombre_bloque,
        lotificacion_id: l.lotificacion_id,
        lotificacion_nombre: l.lotificacion_nombre,
        numero_lote: l.numero_lote,
        area_metros: areaM,
        area_varas: areaV,
        precio_base: precioB,
        precio_vara: areaV > 0 ? Number((precioB / areaV).toFixed(2)) : 0,
        estado: l.estado || 'Disponible',
      };
    });

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/v1/public/cuentas-bancarias', async (req, res) => {
  try {
    const [cuentas] = await pool.query('SELECT * FROM cuentas_bancarias');
    if (cuentas.length === 0) {
      return res.json({
        success: true,
        data: [
          { id: 1, banco: 'BAC Credomatic', numero_cuenta: '365-894120-1', tipo_cuenta: 'Corriente', moneda: 'USD', titular: 'PROYECTOS SAN MIGUEL S.A.' },
          { id: 2, banco: 'BAC Credomatic', numero_cuenta: '365-894125-9', tipo_cuenta: 'Corriente', moneda: 'NIO', titular: 'PROYECTOS SAN MIGUEL S.A.' },
          { id: 3, banco: 'Banco LAFISE Bancentro', numero_cuenta: '109-245890-0', tipo_cuenta: 'Ahorro', moneda: 'USD', titular: 'PROYECTOS SAN MIGUEL S.A.' },
        ],
      });
    }
    res.json({ success: true, data: cuentas });
  } catch {
    res.json({
      success: true,
      data: [
        { id: 1, banco: 'BAC Credomatic', numero_cuenta: '365-894120-1', tipo_cuenta: 'Corriente', moneda: 'USD', titular: 'PROYECTOS SAN MIGUEL S.A.' },
      ],
    });
  }
});

app.post('/api/v1/public/simulador', (req, res) => {
  const { precio_lote, monto_prima, plazo_meses } = req.body;
  const precio = Number(precio_lote) || 10000;
  const prima = Number(monto_prima) || 0;
  const plazo = Number(plazo_meses) || 60;
  const montoFinanciar = Math.max(0, precio - prima);
  const cuota = Number((montoFinanciar / plazo).toFixed(2));

  let saldo = montoFinanciar;
  const tabla = [];
  for (let i = 1; i <= plazo; i++) {
    saldo = Math.max(0, saldo - cuota);
    tabla.push({
      mes: i,
      cuota,
      capital: cuota,
      interes: 0,
      saldo: Number(saldo.toFixed(2)),
    });
  }

  res.json({
    success: true,
    data: {
      monto_financiar: montoFinanciar,
      cuota_mensual: cuota,
      prima_minima: Number((precio * 0.1).toFixed(2)),
      total_financiamiento: Number((prima + cuota * plazo).toFixed(2)),
      tabla_amortizacion: tabla,
    },
  });
});

app.post('/api/v1/public/pre-reservas', async (req, res) => {
  try {
    const { id_lote, lotificacion_id, nombres_apellidos, identificacion, telefono, direccion, monto_anticipo } = req.body;
    const codigo = 'RES-' + Math.floor(10000 + Math.random() * 90000);

    let [clientes] = await pool.query('SELECT id_cliente FROM clientes WHERE identificacion = ?', [identificacion]);
    let clienteId = clientes[0]?.id_cliente;

    if (!clienteId) {
      const [insert] = await pool.query(
        'INSERT INTO clientes (expediente_num, nombres_apellidos, identificacion, telefono, direccion, token_seguimiento) VALUES (?, ?, ?, ?, ?, ?)',
        ['TEMP-' + Math.floor(1000 + Math.random() * 9000), nombres_apellidos, identificacion, telefono, direccion || '', codigo]
      );
      clienteId = insert.insertId;
    }

    await pool.query(
      'INSERT INTO reservas (id_cliente, lotificacion_id, fecha_reserva, monto_reserva, estado) VALUES (?, ?, NOW(), ?, "Activa")',
      [clienteId, lotificacion_id, monto_anticipo || 100]
    );

    await pool.query('UPDATE lotes SET estado = "Reservado" WHERE id_lote = ?', [id_lote]);

    res.json({
      success: true,
      message: 'Pre-reserva registrada con éxito.',
      codigo_reserva: codigo,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==================== AUTH & CLIENT PORTAL ====================

app.post('/api/v1/auth/login-cliente', async (req, res) => {
  try {
    const { identificacion, expediente_num } = req.body;
    const cleanId = (identificacion || '').replace(/-/g, '').trim();

    const [clientes] = await pool.query(
      `SELECT * FROM clientes 
       WHERE (REPLACE(identificacion, '-', '') = ? OR identificacion = ?) 
         AND (expediente_num = ? OR token_seguimiento = ? OR pv_num = ?)`,
      [cleanId, identificacion, expediente_num, expediente_num, expediente_num]
    );

    if (clientes.length === 0) {
      return res.status(401).json({ success: false, message: 'Cédula o Expediente no encontrado.' });
    }

    const cliente = clientes[0];
    const token = 'token_' + Buffer.from(`${cliente.id_cliente}_${Date.now()}`).toString('hex');
    await pool.query('UPDATE clientes SET token_seguimiento = ? WHERE id_cliente = ?', [token, cliente.id_cliente]);

    res.json({
      success: true,
      data: {
        token,
        cliente,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/v1/cliente/contratos', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '').trim();

    const [clientes] = await pool.query('SELECT * FROM clientes WHERE token_seguimiento = ?', [token]);
    const clienteId = clientes[0]?.id_cliente || 1;

    const [ventas] = await pool.query(
      `SELECT ventas.*, lotificaciones.nombre as lotificacion_nombre 
       FROM ventas 
       JOIN lotificaciones ON ventas.lotificacion_id = lotificaciones.id 
       WHERE ventas.id_cliente = ?`,
      [clienteId]
    );

    const formatted = await Promise.all(
      ventas.map(async (v) => {
        const [abonosSum] = await pool.query('SELECT SUM(monto_abonado) as total FROM abonos WHERE id_venta = ?', [v.id_venta]);
        const [cuotasPagadas] = await pool.query('SELECT COUNT(*) as count FROM cuotas WHERE id_venta = ? AND estado = "Pagada"', [v.id_venta]);
        const [cuotasPendientes] = await pool.query('SELECT COUNT(*) as count FROM cuotas WHERE id_venta = ? AND estado = "Pendiente"', [v.id_venta]);
        const [cuotasMora] = await pool.query('SELECT COUNT(*) as count FROM cuotas WHERE id_venta = ? AND estado = "Mora"', [v.id_venta]);
        const [proxima] = await pool.query('SELECT * FROM cuotas WHERE id_venta = ? AND estado IN ("Pendiente", "Mora") ORDER BY fecha_vencimiento ASC LIMIT 1', [v.id_venta]);
        const [loteRow] = await pool.query(
          `SELECT lotes.numero_lote, bloques.nombre as nombre_bloque 
           FROM historial_lotes 
           JOIN lotes ON historial_lotes.id_lote = lotes.id_lote 
           JOIN bloques ON lotes.id_bloque = bloques.id_bloque 
           WHERE historial_lotes.id_venta = ? LIMIT 1`,
          [v.id_venta]
        );

        const totalAbonado = Number(abonosSum[0]?.total) || 0;
        const precioFinal = Number(v.precio_final) || 0;
        const saldoRestante = Math.max(0, precioFinal - totalAbonado);

        return {
          id_venta: v.id_venta,
          id_cliente: v.id_cliente,
          lotificacion_id: v.lotificacion_id,
          lotificacion_nombre: v.lotificacion_nombre,
          lote_identificador: loteRow[0] ? `Lote ${loteRow[0].numero_lote} (${loteRow[0].nombre_bloque})` : `Contrato #${v.id_venta}`,
          fecha_venta: v.fecha_venta,
          precio_final: precioFinal,
          prima_pagada: Number(v.prima_pagada) || 0,
          plazo_meses: v.plazo_meses,
          cuota_mensual: Number(v.cuota_mensual) || 0,
          estado_contrato: v.estado_contrato || 'Vigente',
          beneficiario_final: v.beneficiario_final,
          total_abonado: totalAbonado,
          saldo_restante: saldoRestante,
          cuotas_pagadas_count: cuotasPagadas[0]?.count || 0,
          cuotas_pendientes_count: cuotasPendientes[0]?.count || 0,
          cuotas_mora_count: cuotasMora[0]?.count || 0,
          proxima_cuota_vencimiento: proxima[0]?.fecha_vencimiento || null,
          proxima_cuota_monto: proxima[0] ? Number(proxima[0].monto_total) : Number(v.cuota_mensual),
          estado_pago: cuotasMora[0]?.count > 0 ? 'En Mora' : saldoRestante <= 0 ? 'Completado' : 'Al Día',
        };
      })
    );

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/v1/cliente/contratos/:id_venta/estado-cuenta', async (req, res) => {
  try {
    const [cuotas] = await pool.query('SELECT * FROM cuotas WHERE id_venta = ? ORDER BY numero_cuota ASC', [req.params.id_venta]);
    res.json({ success: true, data: cuotas });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/v1/cliente/contratos/:id_venta/recibos', async (req, res) => {
  try {
    const [abonos] = await pool.query('SELECT * FROM abonos WHERE id_venta = ? ORDER BY fecha_pago DESC', [req.params.id_venta]);
    res.json({ success: true, data: abonos });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/v1/cliente/reportar-pago', (req, res) => {
  const idTramite = 'TRA-' + Math.floor(100000 + Math.random() * 900000);
  res.json({
    success: true,
    message: 'Comprobante recibido exitosamente.',
    id_tramite: idTramite,
  });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor API local activo en http://localhost:${PORT}/api/v1`);
});
