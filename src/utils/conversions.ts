/**
 * Conversión oficial AMSAsystem:
 * 1 metro cuadrado (m²) = 1.418415 varas cuadradas (vrs²)
 * o vrs² = m² / 0.705
 */
export const METROS_TO_VARAS_FACTOR = 1.418415;

export function metrosToVaras(metros: number): number {
  return Number((metros * METROS_TO_VARAS_FACTOR).toFixed(2));
}

export function varasToMetros(varas: number): number {
  return Number((varas / METROS_TO_VARAS_FACTOR).toFixed(2));
}

/**
 * Cálculo de Amortización Francesa / Sistema AMSA
 */
export function calcularCuotaMensual(
  montoFinanciar: number,
  plazoMeses: number,
  tasaAnualPorcentaje: number = 0 // En AMSAsystem muchos contratos son financiamiento directo sin interés o con tasa fija
): number {
  if (plazoMeses <= 0) return 0;
  
  if (tasaAnualPorcentaje <= 0) {
    return Number((montoFinanciar / plazoMeses).toFixed(2));
  }

  const tasaMensual = (tasaAnualPorcentaje / 100) / 12;
  const cuota = montoFinanciar * (tasaMensual * Math.pow(1 + tasaMensual, plazoMeses)) / (Math.pow(1 + tasaMensual, plazoMeses) - 1);
  return Number(cuota.toFixed(2));
}

export function generarTablaAmortizacion(
  montoFinanciar: number,
  plazoMeses: number,
  tasaAnualPorcentaje: number = 0
) {
  const cuota = calcularCuotaMensual(montoFinanciar, plazoMeses, tasaAnualPorcentaje);
  let saldo = montoFinanciar;
  const tabla = [];
  const tasaMensual = (tasaAnualPorcentaje / 100) / 12;

  for (let i = 1; i <= plazoMeses; i++) {
    let interes = 0;
    let capital = cuota;

    if (tasaAnualPorcentaje > 0) {
      interes = saldo * tasaMensual;
      capital = cuota - interes;
    }

    saldo = Math.max(0, saldo - capital);

    tabla.push({
      mes: i,
      cuota: Number(cuota.toFixed(2)),
      capital: Number(capital.toFixed(2)),
      interes: Number(interes.toFixed(2)),
      saldo: Number(saldo.toFixed(2)),
    });
  }

  return tabla;
}
