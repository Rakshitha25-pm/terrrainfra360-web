import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, IndianRupee, Percent, BarChart3, ChevronDown, Info } from 'lucide-react';

// Bengaluru micro-market appreciation rates (CAGR %)
// Based on historical market data for premium Bengaluru localities
const BENGALURU_ZONES: { label: string; cagr: number; description: string }[] = [
  { label: 'North Bengaluru (Hebbal / Yelahanka)', cagr: 11.5, description: 'Fastest growing corridor, driven by KIAL & aerospace hub' },
  { label: 'East Bengaluru (Whitefield / ITPL)', cagr: 10.2, description: 'IT corridor with sustained demand from tech workforce' },
  { label: 'South Bengaluru (Jayanagar / JP Nagar)', cagr: 8.5, description: 'Established residential belt with steady appreciation' },
  { label: 'Central Bengaluru (Indiranagar / Koramangala)', cagr: 9.0, description: 'Premium micro-market, limited supply drives value' },
  { label: 'West Bengaluru (Rajajinagar / Yeshwanthpur)', cagr: 8.0, description: 'Infrastructure-led growth near metro corridors' },
  { label: 'Peripheral Areas (Sarjapur / Devanahalli)', cagr: 13.0, description: 'High growth potential, land-led appreciation' },
];

// Projection horizon options
const HORIZONS = [5, 10, 15];

// Format Indian currency with Cr / L abbreviation
const formatINR = (val: number): string => {
  if (val >= 1e7) return `₹${(val / 1e7).toFixed(2)} Cr`;
  if (val >= 1e5) return `₹${(val / 1e5).toFixed(1)} L`;
  return `₹${val.toLocaleString('en-IN')}`;
};

// Compute year-by-year projections
interface YearData {
  year: number;
  propertyValue: number;
  annualRental: number;
  cumulativeRental: number;
  totalReturn: number;
  roi: number;
}

function computeProjections(
  purchasePrice: number,
  rentalYield: number,
  cagr: number,
  horizon: number,
): YearData[] {
  const rows: YearData[] = [];
  let cumRental = 0;

  for (let y = 1; y <= horizon; y++) {
    const propValue = purchasePrice * Math.pow(1 + cagr / 100, y);
    // Rental income also grows at ~5% per annum (Bengaluru rental escalation avg)
    const annualRental = purchasePrice * (rentalYield / 100) * Math.pow(1.05, y - 1);
    cumRental += annualRental;
    const capitalGain = propValue - purchasePrice;
    const totalReturn = capitalGain + cumRental;
    const roi = (totalReturn / purchasePrice) * 100;
    rows.push({ year: y, propertyValue: propValue, annualRental, cumulativeRental: cumRental, totalReturn, roi });
  }
  return rows;
}

// Tiny SVG line chart — pure SVG, no external charting library
const LineChart = ({ data, width = 600, height = 220 }: { data: YearData[]; width?: number; height?: number }) => {
  const PAD = { top: 20, right: 20, bottom: 36, left: 70 };
  const chartW = width - PAD.left - PAD.right;
  const chartH = height - PAD.top - PAD.bottom;

  const allValues = data.flatMap(d => [d.propertyValue, d.totalReturn, d.cumulativeRental]);
  const minVal = 0;
  const maxVal = Math.max(...allValues) * 1.08;

  const xScale = (i: number) => (i / (data.length - 1)) * chartW;
  const yScale = (v: number) => chartH - ((v - minVal) / (maxVal - minVal)) * chartH;

  const pathFor = (key: keyof YearData) =>
    data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)},${yScale(d[key] as number)}`).join(' ');

  const xLabels = data.map((d, i) => ({ x: xScale(i), label: `Yr ${d.year}` }));

  // Y axis tick count
  const yTicks = 5;
  const yTickValues = Array.from({ length: yTicks }, (_, i) => (maxVal / (yTicks - 1)) * i);

  const lines = [
    { key: 'propertyValue' as keyof YearData, color: '#C9A84C', label: 'Property Value', dash: '' },
    { key: 'totalReturn' as keyof YearData, color: '#60A5FA', label: 'Total Return', dash: '6,3' },
    { key: 'cumulativeRental' as keyof YearData, color: '#34D399', label: 'Rental Income', dash: '3,3' },
  ];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" style={{ overflow: 'visible' }}>
      {/* Grid lines */}
      {yTickValues.map((v, i) => (
        <g key={i}>
          <line
            x1={PAD.left} y1={PAD.top + yScale(v)}
            x2={PAD.left + chartW} y2={PAD.top + yScale(v)}
            stroke="currentColor" strokeOpacity={0.06} strokeWidth={1}
          />
          <text
            x={PAD.left - 8} y={PAD.top + yScale(v) + 4}
            textAnchor="end" fontSize={9} fill="currentColor" fillOpacity={0.45}
            fontFamily="sans-serif"
          >
            {v >= 1e7 ? `${(v / 1e7).toFixed(1)}Cr` : v >= 1e5 ? `${(v / 1e5).toFixed(0)}L` : ''}
          </text>
        </g>
      ))}

      {/* Paths */}
      {lines.map(({ key, color, dash }) => (
        <path
          key={key}
          d={pathFor(key)}
          transform={`translate(${PAD.left},${PAD.top})`}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeDasharray={dash}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}

      {/* Data dots for property value */}
      {data.map((d, i) => (
        <circle
          key={i}
          cx={PAD.left + xScale(i)}
          cy={PAD.top + yScale(d.propertyValue)}
          r={3.5}
          fill="#C9A84C"
          stroke="var(--paper, white)"
          strokeWidth={1.5}
        />
      ))}

      {/* X axis labels */}
      {xLabels.map(({ x, label }, i) => (
        <text
          key={i}
          x={PAD.left + x}
          y={height - 6}
          textAnchor="middle"
          fontSize={9}
          fill="currentColor"
          fillOpacity={0.45}
          fontFamily="sans-serif"
        >
          {label}
        </text>
      ))}

      {/* Legend */}
      {lines.map(({ color, label, dash }, i) => (
        <g key={label} transform={`translate(${PAD.left + i * 155},4)`}>
          <line x1={0} y1={6} x2={22} y2={6} stroke={color} strokeWidth={2.5} strokeDasharray={dash} strokeLinecap="round" />
          <text x={28} y={10} fontSize={9.5} fill={color} fontFamily="sans-serif" fontWeight="600">{label}</text>
        </g>
      ))}
    </svg>
  );
};

interface ROIEstimatorProps {
  defaultPrice?: number;
}

export default function ROIEstimator({ defaultPrice }: ROIEstimatorProps) {
  const [purchasePriceInput, setPurchasePriceInput] = useState(
    defaultPrice ? String(Math.round(defaultPrice / 1e7 * 100) / 100) : '2.5'
  );
  const [rentalYield, setRentalYield] = useState(3.5);
  const [selectedZoneIdx, setSelectedZoneIdx] = useState(0);
  const [horizon, setHorizon] = useState(10);
  const [showZoneDropdown, setShowZoneDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<'chart' | 'table'>('chart');

  // Parse purchase price from Cr input
  const purchasePrice = useMemo(() => {
    const v = parseFloat(purchasePriceInput);
    return isNaN(v) || v <= 0 ? 0 : v * 1e7;
  }, [purchasePriceInput]);

  const zone = BENGALURU_ZONES[selectedZoneIdx];
  const projections = useMemo(
    () => purchasePrice > 0 ? computeProjections(purchasePrice, rentalYield, zone.cagr, horizon) : [],
    [purchasePrice, rentalYield, zone.cagr, horizon]
  );

  const finalYear = projections[projections.length - 1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Section header */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[var(--line)]" />
        <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-luxury-gold flex items-center gap-2">
          <TrendingUp size={12} /> ROI Estimator
        </span>
        <div className="h-px flex-1 bg-[var(--line)]" />
      </div>

      <div className="bg-[var(--paper)] border border-[var(--line)] rounded-3xl p-6 md:p-8 space-y-7 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-luxury-gold/4 blur-[120px] rounded-full pointer-events-none" />

        {/* Inputs row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Purchase Price */}
          <div className="space-y-2">
            <label className="text-[9px] font-bold tracking-[0.3em] uppercase text-luxury-gold flex items-center gap-1.5">
              <IndianRupee size={10} /> Purchase Price (Cr)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] text-sm font-serif">₹</span>
              <input
                type="number"
                min={0.01}
                step={0.1}
                value={purchasePriceInput}
                onChange={e => setPurchasePriceInput(e.target.value)}
                className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-xl pl-8 pr-4 py-3 text-sm font-serif font-bold text-[var(--ink)] focus:outline-none focus:border-luxury-gold transition-colors"
                placeholder="2.50"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Cr</span>
            </div>
          </div>

          {/* Rental Yield */}
          <div className="space-y-2">
            <label className="text-[9px] font-bold tracking-[0.3em] uppercase text-luxury-gold flex items-center gap-1.5">
              <Percent size={10} /> Rental Yield (%)
            </label>
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={15}
                  step={0.1}
                  value={rentalYield}
                  onChange={e => setRentalYield(Math.min(15, Math.max(0, parseFloat(e.target.value) || 0)))}
                  className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-xl pl-4 pr-10 py-3 text-sm font-serif font-bold text-[var(--ink)] focus:outline-none focus:border-luxury-gold transition-colors"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-luxury-gold">%</span>
              </div>
              <input
                type="range" min={0} max={10} step={0.1}
                value={rentalYield}
                onChange={e => setRentalYield(parseFloat(e.target.value))}
                className="w-full accent-luxury-gold h-1 rounded-full cursor-pointer"
              />
            </div>
          </div>

          {/* Bengaluru Zone */}
          <div className="space-y-2 sm:col-span-2 lg:col-span-1">
            <label className="text-[9px] font-bold tracking-[0.3em] uppercase text-luxury-gold flex items-center gap-1.5">
              <BarChart3 size={10} /> Market Zone
            </label>
            <div className="relative">
              <button
                onClick={() => setShowZoneDropdown(v => !v)}
                className="w-full flex items-center justify-between bg-[var(--bg)] border border-[var(--line)] rounded-xl px-4 py-3 text-left text-xs font-bold text-[var(--ink)] hover:border-luxury-gold focus:outline-none focus:border-luxury-gold transition-colors"
              >
                <span className="truncate pr-2 leading-snug">{zone.label}</span>
                <ChevronDown size={13} className={`shrink-0 transition-transform ${showZoneDropdown ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {showZoneDropdown && (
                  <>
                    <div className="fixed inset-0 z-[400]" onClick={() => setShowZoneDropdown(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      className="absolute top-[calc(100%+6px)] left-0 right-0 z-[410] bg-[var(--paper)] border border-[var(--line)] rounded-2xl shadow-2xl overflow-hidden"
                    >
                      {BENGALURU_ZONES.map((z, i) => (
                        <button
                          key={i}
                          onClick={() => { setSelectedZoneIdx(i); setShowZoneDropdown(false); }}
                          className={`w-full text-left px-4 py-3.5 transition-colors hover:bg-luxury-gold/5 border-b border-[var(--line)] last:border-0 ${i === selectedZoneIdx ? 'text-luxury-gold' : 'text-[var(--ink)]'}`}
                        >
                          <div className="text-[11px] font-bold leading-snug">{z.label}</div>
                          <div className="text-[10px] text-[var(--muted)] mt-0.5 font-light">{z.description}</div>
                          <div className="text-[10px] font-bold text-luxury-gold mt-0.5">CAGR {z.cagr}%</div>
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Projection Horizon */}
          <div className="space-y-2">
            <label className="text-[9px] font-bold tracking-[0.3em] uppercase text-luxury-gold">Horizon</label>
            <div className="flex gap-2 h-[46px]">
              {HORIZONS.map(h => (
                <button
                  key={h}
                  onClick={() => setHorizon(h)}
                  className={`flex-1 rounded-xl border text-xs font-bold tracking-wide transition-all ${horizon === h ? 'bg-luxury-gold text-white border-luxury-gold shadow-md shadow-luxury-gold/20' : 'border-[var(--line)] text-[var(--ink)] hover:border-luxury-gold/60'}`}
                >
                  {h}Y
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CAGR assumption badge */}
        <div className="flex items-start gap-2 bg-luxury-gold/5 border border-luxury-gold/20 rounded-xl px-4 py-3">
          <Info size={13} className="text-luxury-gold shrink-0 mt-0.5" />
          <p className="text-[10px] text-[var(--muted)] leading-relaxed">
            Using <span className="font-bold text-luxury-gold">{zone.cagr}% annual appreciation (CAGR)</span> for {zone.label.split('(')[0].trim()} based on Bengaluru real estate historical trends.
            Rental income assumes <span className="font-bold text-luxury-gold">5% annual escalation</span>. This is an estimate for illustrative purposes only.
          </p>
        </div>

        {/* Summary cards */}
        {finalYear && purchasePrice > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Projected Value', value: formatINR(finalYear.propertyValue), sub: `In ${horizon} years`, color: 'text-luxury-gold' },
              { label: 'Capital Gain', value: formatINR(finalYear.propertyValue - purchasePrice), sub: `${((finalYear.propertyValue - purchasePrice) / purchasePrice * 100).toFixed(0)}% appreciation`, color: 'text-blue-400' },
              { label: 'Rental Income', value: formatINR(finalYear.cumulativeRental), sub: `Cumulative over ${horizon} yrs`, color: 'text-emerald-400' },
              { label: 'Total ROI', value: `${finalYear.roi.toFixed(0)}%`, sub: `On ₹${(purchasePrice / 1e7).toFixed(2)} Cr invested`, color: 'text-purple-400' },
            ].map(({ label, value, sub, color }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-[var(--bg)] border border-[var(--line)] rounded-2xl p-4 text-center"
              >
                <p className="text-[9px] font-bold tracking-[0.25em] uppercase text-[var(--muted)] mb-1.5">{label}</p>
                <p className={`text-lg font-serif font-bold ${color} leading-none`}>{value}</p>
                <p className="text-[9px] text-[var(--muted)] mt-1.5 font-light">{sub}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Tab switcher */}
        {projections.length > 0 && (
          <div>
            <div className="flex items-center gap-1 mb-5 bg-[var(--bg)] border border-[var(--line)] rounded-full p-1 w-fit">
              {(['chart', 'table'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase transition-all ${activeTab === tab ? 'bg-luxury-gold text-white shadow-md' : 'text-[var(--muted)] hover:text-[var(--ink)]'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'chart' ? (
                <motion.div
                  key="chart"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-[var(--bg)] border border-[var(--line)] rounded-2xl p-4 text-[var(--ink)]"
                >
                  <LineChart data={projections} />
                </motion.div>
              ) : (
                <motion.div
                  key="table"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="overflow-x-auto rounded-2xl border border-[var(--line)]"
                >
                  <table className="w-full text-[11px] font-medium">
                    <thead>
                      <tr className="bg-luxury-dark text-white">
                        {['Year', 'Property Value', 'Annual Rent', 'Cumul. Rent', 'Total Return', 'ROI %'].map(h => (
                          <th key={h} className="px-4 py-3 text-[9px] font-bold tracking-[0.2em] uppercase text-left text-white/60 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {projections.map((row, i) => (
                        <tr
                          key={row.year}
                          className={`border-t border-[var(--line)] transition-colors hover:bg-luxury-gold/5 ${[4, 9, 14].includes(i) ? 'bg-luxury-gold/5' : ''}`}
                        >
                          <td className="px-4 py-3 font-bold text-luxury-gold">Yr {row.year}</td>
                          <td className="px-4 py-3 text-[var(--ink)]">{formatINR(row.propertyValue)}</td>
                          <td className="px-4 py-3 text-emerald-500">{formatINR(row.annualRental)}</td>
                          <td className="px-4 py-3 text-emerald-400">{formatINR(row.cumulativeRental)}</td>
                          <td className="px-4 py-3 text-blue-400">{formatINR(row.totalReturn)}</td>
                          <td className="px-4 py-3 font-bold text-purple-400">{row.roi.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {purchasePrice === 0 && (
          <div className="text-center py-8 text-[var(--muted)] text-sm font-light italic">
            Enter a purchase price to see your ROI projections.
          </div>
        )}
      </div>
    </motion.div>
  );
}
