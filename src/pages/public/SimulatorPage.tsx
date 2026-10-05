import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Calculator, Sparkles, Table, ChevronDown, ChevronUp, BookmarkCheck, DollarSign } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { calcularCuotaMensual, generarTablaAmortizacion } from '../../utils/conversions';

export const SimulatorPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialPrecio = Number(searchParams.get('precio')) || 10800;
  const initialLoteName = searchParams.get('lote') || '';
  const loteId = searchParams.get('id');

  const [precioLote, setPrecioLote] = useState<number>(initialPrecio);
  const [primaPorcentaje, setPrimaPorcentaje] = useState<number>(10);
  const [plazoMeses, setPlazoMeses] = useState<number>(60);
  const [showTable, setShowTable] = useState<boolean>(false);

  useEffect(() => {
    if (initialPrecio) {
      setPrecioLote(initialPrecio);
    }
  }, [initialPrecio]);

  const primaMonto = Number(((precioLote * primaPorcentaje) / 100).toFixed(2));
  const montoFinanciar = Math.max(0, precioLote - primaMonto);
  const cuotaEstimada = calcularCuotaMensual(montoFinanciar, plazoMeses, 0);
  const tablaAmortizacion = generarTablaAmortizacion(montoFinanciar, plazoMeses, 0);

  const plazosPredefinidos = [24, 36, 48, 60, 72, 84];

  return (
    <div className="space-y-5 animate-fadeIn pb-6">
      {/* Header */}
      <div className="p-4 rounded-3xl glass-card space-y-1.5 border border-brand-500/20 shadow-glass">
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 text-[11px] font-bold">
          <Sparkles className="w-3 h-3" />
          <span>Financiamiento Directo AMSA</span>
        </div>
        <h2 className="text-xl font-black text-white">Simulador de Financiamiento</h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          {initialLoteName ? `Calculando para: Lote ${initialLoteName}` : 'Personaliza tu prima y plazo sin trámites engorrosos.'}
        </p>
      </div>

      {/* Main Result Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-navy-950 text-white shadow-card-glow space-y-3">
        <span className="text-[11px] uppercase tracking-wider font-extrabold text-brand-200">
          Cuota Mensual Estimada
        </span>
        <div className="flex items-baseline space-x-1">
          <span className="text-4xl font-black tracking-tight">{formatCurrency(cuotaEstimada)}</span>
          <span className="text-xs text-brand-200 font-medium">/ mes</span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-brand-500/40 text-xs">
          <div>
            <span className="text-brand-200 text-[10px] block">Monto a Financiar</span>
            <span className="font-bold text-sm text-white">{formatCurrency(montoFinanciar)}</span>
          </div>
          <div>
            <span className="text-brand-200 text-[10px] block">Prima Inicial ({primaPorcentaje}%)</span>
            <span className="font-bold text-sm text-amber-300">{formatCurrency(primaMonto)}</span>
          </div>
        </div>
      </div>

      {/* Calculator Controls */}
      <div className="p-4 rounded-3xl glass-card space-y-4">
        {/* Precio del Lote */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <label className="font-bold text-slate-300">Precio Total del Terreno</label>
            <span className="font-extrabold text-brand-400">{formatCurrency(precioLote)}</span>
          </div>
          <div className="relative">
            <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="number"
              min="1000"
              max="500000"
              step="100"
              value={precioLote}
              onKeyDown={(e) => {
                if (['-', '+', 'e', 'E'].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              onWheel={(e) => (e.target as HTMLElement).blur()}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setPrecioLote(isNaN(v) ? 0 : Math.max(0, v));
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-input text-white text-sm font-semibold focus:outline-none"
            />
          </div>
        </div>

        {/* Prima Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label className="font-bold text-slate-300">Prima / Anticipo Inicial</label>
            <span className="font-extrabold text-amber-400">
              {primaPorcentaje}% ({formatCurrency(primaMonto)})
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            step="5"
            value={primaPorcentaje}
            onChange={(e) => setPrimaPorcentaje(Number(e.target.value))}
            className="w-full accent-brand-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-semibold px-1">
            <span>0% (Sin Prima)</span>
            <span>20%</span>
            <span>50%</span>
          </div>
        </div>

        {/* Plazo Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 block">Plazo del Financiamiento</label>
          <div className="grid grid-cols-3 gap-2">
            {plazosPredefinidos.map((meses) => (
              <button
                key={meses}
                onClick={() => setPlazoMeses(meses)}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  plazoMeses === meses
                    ? 'bg-brand-500 text-navy-950 shadow-card-glow'
                    : 'bg-slate-800/80 text-slate-300 border border-slate-700/60'
                }`}
              >
                {meses} meses ({meses / 12} años)
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5">
        <button
          onClick={() =>
            navigate(
              `/pre-reserva?precio=${precioLote}&prima=${primaMonto}&plazo=${plazoMeses}${
                loteId ? `&lote_id=${loteId}` : ''
              }`
            )
          }
          className="w-full py-3.5 px-4 rounded-2xl bg-brand-500 hover:bg-brand-400 active:scale-98 text-navy-950 text-sm font-black flex items-center justify-center space-x-2 shadow-card-glow transition-all"
        >
          <BookmarkCheck className="w-5 h-5" />
          <span>Apartar con este Plan</span>
        </button>

        <button
          onClick={() => setShowTable(!showTable)}
          className="w-full py-2.5 px-4 rounded-2xl glass-card text-xs font-semibold text-slate-300 flex items-center justify-center space-x-1.5 hover:text-white"
        >
          <Table className="w-4 h-4 text-brand-400" />
          <span>{showTable ? 'Ocultar Plan de Amortización' : 'Ver Tabla de Amortización'}</span>
          {showTable ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
        </button>
      </div>

      {/* Amortization Table */}
      {showTable && (
        <div className="p-4 rounded-3xl glass-card space-y-3 animate-fadeIn">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Tabla Amortizada Proyectada ({plazoMeses} Cuotas)
          </h4>
          <div className="overflow-x-auto max-h-64 rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 sticky top-0 text-slate-400 text-[10px] uppercase font-bold">
                <tr>
                  <th className="p-2.5">Mes</th>
                  <th className="p-2.5">Cuota</th>
                  <th className="p-2.5">Capital</th>
                  <th className="p-2.5">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {tablaAmortizacion.map((row) => (
                  <tr key={row.mes} className="hover:bg-slate-800/40">
                    <td className="p-2 font-bold text-white">#{row.mes}</td>
                    <td className="p-2 text-brand-400 font-semibold">{formatCurrency(row.cuota)}</td>
                    <td className="p-2">{formatCurrency(row.capital)}</td>
                    <td className="p-2 font-medium">{formatCurrency(row.saldo)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
