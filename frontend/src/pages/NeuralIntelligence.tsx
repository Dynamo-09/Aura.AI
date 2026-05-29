import { useOutletContext } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Brush, ReferenceDot } from 'recharts';
import type { OutletContextData } from '../components/Layout';

export default function NeuralIntelligence() {
  const { availableStocks, setSelectedStock, selectedStock, stockData, formatPrice, chartColors } = useOutletContext<OutletContextData>();

  const getAnomaly = (ticker: string) => {
    let hash = 0;
    for (let i = 0; i < ticker.length; i++) hash = ticker.charCodeAt(i) + ((hash << 5) - hash);
    const shift = (Math.abs(hash) % 50) / 10; // 0.0 to 5.0 sigma
    const isCritical = shift > 3.5;
    const probability = (Math.abs(hash) % 100) / 1000; // 0.00 to 0.10 %
    return { shift, isCritical, probability };
  };

  const currentYear = new Date().getFullYear();
  const basePrice = stockData?.current_price || 300;
  const anomaly = getAnomaly(selectedStock);
  
  const chartData = [
    { label: `Jan 10, ${currentYear}`, value: basePrice * 0.92, isAnomaly: false },
    { label: `Feb 15, ${currentYear}`, value: basePrice * 0.95, isAnomaly: false },
    { label: `Mar 20, ${currentYear}`, value: basePrice * (1 + anomaly.shift/100), isAnomaly: true },
    { label: `Apr 25, ${currentYear}`, value: basePrice * 0.98, isAnomaly: false },
    { label: `May 30, ${currentYear}`, value: basePrice * 0.94, isAnomaly: false },
    { label: `Jun 05, ${currentYear}`, value: basePrice * 1.02, isAnomaly: false },
    { label: `Jul 10, ${currentYear}`, value: basePrice, isAnomaly: anomaly.isCritical },
    { label: `Aug 15, ${currentYear}`, value: basePrice * 1.05, isAnomaly: false }
  ];

  let chartColor = '#00e3fd';
  if (chartColors === 'colorblind') chartColor = '#5a90ff';
  else if (chartColors === 'neon') chartColor = '#00e3fd';

  return (
    <div className="space-y-10">
      <div className="mb-10">
        <div className="flex items-end gap-6 mb-2">
          <h2 className="text-5xl font-bold font-headline tracking-tighter text-on-surface">Neural Intelligence</h2>
          <span className="text-secondary font-label tracking-[0.3em] mb-2 uppercase text-[10px] bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20">Active Scanner v4.2</span>
        </div>
        <p className="text-on-surface-variant max-w-2xl font-light">Synthesizing multi-modal market sentiment with algorithmic volatility patterns. System status: <span className="text-secondary font-bold tracking-widest uppercase">OPTIMIZED</span></p>
      </div>

      {/* Dashboard Layout Grid */}
      <div className="grid grid-cols-12 gap-8 items-start">
        {/* Left Column: Primary Visualization */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {/* Main Volatility Chart Card */}
          <div className="bg-surface-container-low rounded-xl p-8 relative overflow-hidden group border border-outline-variant/10 shadow-xl shadow-black/30">
            <div className="absolute top-0 right-0 p-8 flex gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase font-label tracking-widest text-on-surface-variant">Scanner Sensitivity</span>
                <span className="text-xl font-headline font-bold text-secondary">98.4%</span>
              </div>
            </div>
            <div className="mb-12">
              <h3 className="text-xl font-headline font-medium mb-1 text-on-surface">Volatility &amp; Anomaly Scanner</h3>
              <p className="text-xs text-on-surface-variant font-label uppercase tracking-widest">Real-time anomaly detection across Global Indices</p>
            </div>
            
            {/* Custom Visual: Simulated Chart with Anomaly Points */}
            <div className="relative h-[400px] w-full mt-8 text-xs">
              <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                          <linearGradient id="chartGradientNeural" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={chartColor} stopOpacity={0.3}/>
                              <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                          </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2636" vertical={false} />
                      <XAxis dataKey="label" stroke="#94a3b8" tick={{fill: '#94a3b8', fontSize: 10}} tickMargin={10} minTickGap={20} />
                      <YAxis stroke="#94a3b8" tick={{fill: '#94a3b8', fontSize: 10}} tickFormatter={(value) => formatPrice(value)} domain={['auto', 'auto']} orientation="right" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: `1px solid ${chartColor}4d`, borderRadius: '8px', color: '#fff' }} 
                        formatter={(value: number) => [formatPrice(value), 'Price']}
                        isAnimationActive={false}
                      />
                      <Area type="monotone" dataKey="value" stroke={chartColor} strokeWidth={3} fill="url(#chartGradientNeural)" isAnimationActive={true} />
                      
                      {chartData.filter(d => d.isAnomaly).map((d, i) => (
                         <ReferenceDot key={i} x={d.label} y={d.value} r={6} fill="#ff716c" stroke="none" className="animate-pulse" />
                      ))}
                      {chartData.filter(d => d.isAnomaly).map((d, i) => (
                         <ReferenceDot key={`ring-${i}`} x={d.label} y={d.value} r={14} fill="none" stroke="#ff716c" strokeOpacity={0.4} strokeWidth={1} />
                      ))}
                      
                      <Brush dataKey="label" height={30} stroke={chartColor} fill="rgba(15, 23, 42, 0.8)" tickFormatter={() => ''} travellerWidth={10} />
                  </AreaChart>
              </ResponsiveContainer>

              {/* Tooltip Callout */}
              <div className="absolute top-[20px] left-[60px] bg-surface-container-highest/90 backdrop-blur-md p-4 rounded-xl border border-error/20 shadow-2xl z-10 pointer-events-none">
                <p className="text-error font-bold text-xs uppercase mb-1">{anomaly.isCritical ? 'Critical Anomaly' : 'Minor Variance'}</p>
                <p className="text-xl font-headline font-bold text-on-surface">{anomaly.shift.toFixed(1)}σ Shift</p>
                <p className="text-[10px] text-on-surface-variant font-label tracking-wider mt-1">PROBABILITY: {anomaly.probability.toFixed(3)}%</p>
              </div>
            </div>

            {/* Chart Legend/Metadata */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-outline-variant/10">
              <div className="p-4 bg-surface-container/50 rounded-xl">
                <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest mb-1">Standard Deviation</p>
                <p className="text-lg font-bold text-on-surface">1.42 <span className="text-secondary text-sm ml-1">+0.04</span></p>
              </div>
              <div className="p-4 bg-surface-container/50 rounded-xl">
                <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest mb-1">Entropy Score</p>
                <p className="text-lg font-bold text-on-surface">0.892</p>
              </div>
              <div className="p-4 bg-surface-container/50 rounded-xl">
                <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest mb-1">Scan Interval</p>
                <p className="text-lg font-bold text-on-surface">150ms</p>
              </div>
            </div>
          </div>

          {/* Asset Anomaly Matrix */}
          <div className="bg-surface-container-low rounded-xl p-8 border border-outline-variant/10 shadow-lg shadow-black/20">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-headline font-bold flex items-center gap-2">
                   <span className="material-symbols-outlined text-secondary">blur_on</span>
                   Market Anomaly Feed
                </h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-surface-container-highest scrollbar-track-transparent">
                 {availableStocks.map((stock) => {
                     const anomaly = getAnomaly(stock.ticker);
                     return (
                         <div 
                           key={stock.ticker}
                           onClick={() => setSelectedStock(stock.ticker)}
                           className={`p-4 rounded-xl cursor-pointer border flex justify-between items-center transition-all ${selectedStock === stock.ticker ? 'bg-surface-container-highest border-secondary shadow-[0_0_10px_rgba(0,227,253,0.15)]' : 'bg-surface-container hover:bg-surface-container-high border-outline-variant/10'}`}
                         >
                             <div>
                                 <h4 className="font-bold text-sm text-on-surface">{stock.ticker}</h4>
                                 <p className="text-[10px] text-on-surface-variant truncate w-[100px]">{stock.name}</p>
                             </div>
                             <div className="text-right">
                                 <p className={`text-lg font-bold font-headline ${anomaly.isCritical ? 'text-error animate-pulse' : 'text-primary'}`}>
                                    {anomaly.shift.toFixed(1)}σ
                                 </p>
                                 <p className="text-[9px] uppercase tracking-widest text-on-surface-variant">Deviance</p>
                             </div>
                         </div>
                     )
                 })}
             </div>
          </div>

        </div>

        {/* Right Column: 5-Day Sector Outlook */}
        <aside className="col-span-12 lg:col-span-4 space-y-8">
          <div className="bg-surface-container p-8 rounded-xl border border-outline-variant/10 shadow-lg shadow-black/20">
            <div className="mb-10">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-headline font-bold text-on-surface">5-Day Outlook</h3>
                <span className="material-symbols-outlined text-on-surface-variant text-sm">more_horiz</span>
              </div>
              <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant">Neural Sector Forecasting</p>
            </div>
            
            <div className="space-y-10">
              {/* Sector Item */}
              <div>
                <div className="flex justify-between items-end mb-3">
                  <span className="font-medium text-sm text-on-surface">Technology</span>
                  <span className="text-sm font-bold text-secondary">+12.4%</span>
                </div>
                <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full w-[85%] bg-gradient-to-r from-primary to-secondary rounded-full shadow-[0_0_8px_#00e3fd]"></div>
                </div>
              </div>
              {/* Sector Item */}
              <div>
                <div className="flex justify-between items-end mb-3">
                  <span className="font-medium text-sm text-on-surface">Telecommunications</span>
                  <span className="text-sm font-bold text-on-surface">+3.2%</span>
                </div>
                <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full w-[42%] bg-primary-dim rounded-full"></div>
                </div>
              </div>
              {/* Sector Item */}
              <div>
                <div className="flex justify-between items-end mb-3">
                  <span className="font-medium text-sm text-on-surface">Consumer Discretionary</span>
                  <span className="text-sm font-bold text-error">-5.8%</span>
                </div>
                <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full w-[28%] bg-error rounded-full"></div>
                </div>
              </div>
              {/* Sector Item */}
              <div>
                <div className="flex justify-between items-end mb-3">
                  <span className="font-medium text-sm text-on-surface">Energy &amp; Resources</span>
                  <span className="text-sm font-bold text-on-surface">+1.4%</span>
                </div>
                <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full w-[15%] bg-outline rounded-full"></div>
                </div>
              </div>
              {/* Sector Item */}
              <div>
                <div className="flex justify-between items-end mb-3">
                  <span className="font-medium text-sm text-on-surface">Healthcare</span>
                  <span className="text-sm font-bold text-secondary">+8.1%</span>
                </div>
                <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full w-[64%] bg-gradient-to-r from-primary to-secondary rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="mt-12 bg-surface-container-high rounded-xl p-6 border border-secondary/10">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                <span className="font-bold text-sm text-on-surface">Neural Recommendation</span>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed">System suggests increasing exposure to <span className="text-secondary font-bold">Semiconductor Fab</span> clusters within the next 48 trading hours.</p>
              <button className="w-full mt-6 py-3 border border-secondary/30 text-secondary text-xs font-bold uppercase tracking-widest rounded-full hover:bg-secondary/10 hover:shadow-[0_0_15px_rgba(0,227,253,0.2)] transition-all">Execute Rebalance</button>
            </div>
          </div>
          
          {/* Market Hot-Map Small Card */}
          <div className="relative rounded-xl overflow-hidden aspect-video group cursor-pointer border border-outline-variant/10 shadow-lg shadow-black/20">
            <img alt="Data visualization" className="absolute inset-0 w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBW_gaHQfbJYezbwQ2V4NWXDD5b3l8W1YRUVI263-JZ7Fh8Z3Src0_JxeSlajUoV1NVJ1Q296TOPe3pf9Gar0WzF8rE5ntbcejYMpIBBaHEY2dzSejoZ2uGUuWAL_rMLkfm2-cY4qma5HUA8dvzCr29Uathx0S9PoeUQjhLNNlt3iq2pHPlo2fcMp7V8yaHZSLJKv71odAD54ul8c1rI-kh1Yj1tS249YTnngA-TxXmBVuOMxhsqfL1D6J9CAwRqzbROCIOE0MMuBc"/>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-[10px] font-label uppercase tracking-widest text-secondary mb-1 drop-shadow-md">Live Feed</p>
              <h4 className="text-lg font-headline font-bold leading-tight text-white drop-shadow-lg">London Exchange Connectivity Optimized</h4>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
