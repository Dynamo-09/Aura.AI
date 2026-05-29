import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Brush, ReferenceLine } from 'recharts';
import type { OutletContextData } from '../components/Layout';

export default function AiScanner() {
  const { stockData, triggerTrade, availableStocks, selectedStock, setSelectedStock, formatPrice, chartColors } = useOutletContext<OutletContextData>();
  const [investmentAmount, setInvestmentAmount] = useState(25000);

  let chartUpColor = '#00e3fd'; // standard (secondary)
  let chartDownColor = '#ff716c'; // standard (error)
  let chartStrokeWidth = 3;

  if (chartColors === 'colorblind') {
      chartUpColor = '#5a90ff'; // blue
      chartDownColor = '#ffb74d'; // orange
  } else if (chartColors === 'neon') {
      chartUpColor = '#00e3fd'; // cyan
      chartDownColor = '#ff66cc'; // pink
      chartStrokeWidth = 4;
  }
  // Helper to generate deterministic mock predictions for any ticker
  const getPrediction = (ticker: string) => {
    let hash = 0;
    for (let i = 0; i < ticker.length; i++) hash = ticker.charCodeAt(i) + ((hash << 5) - hash);
    const isPositive = hash % 2 === 0;
    const gain = (Math.abs(hash) % 2500) / 100; // 0 to 25%
    const confidence = 85 + (Math.abs(hash) % 140) / 10; // 85 to 99%
    const action = isPositive ? (gain > 12 ? 'Strong Buy' : 'Buy') : (gain > 12 ? 'Strong Sell' : 'Sell');
    const color = isPositive ? 'text-secondary bg-secondary/10' : 'text-error bg-error/10';
    return { gain: isPositive ? gain : -gain, confidence, action, color, isPositive };
  };

  const selectedPrediction = getPrediction(selectedStock);
  const currentYear = new Date().getFullYear();
  const basePrice = stockData?.current_price || 300;
  
  const chartData = [
    { label: `MON 08, ${currentYear}`, historicalValue: basePrice * 0.95 },
    { label: `TUE 09, ${currentYear}`, historicalValue: basePrice * 0.98 },
    { label: `WED 10, ${currentYear}`, historicalValue: basePrice * 0.92 },
    { label: `THU 11, ${currentYear}`, historicalValue: basePrice * 0.97 },
    { label: `FRI 12, ${currentYear}`, historicalValue: basePrice, predictedValue: basePrice },
    { label: `SAT 13, ${currentYear} (F)`, predictedValue: basePrice * (1 + selectedPrediction.gain/100 * 0.5) },
    { label: `SUN 14, ${currentYear} (F)`, predictedValue: basePrice * (1 + selectedPrediction.gain/100) }
  ];

  const chartColor = selectedPrediction.isPositive ? chartUpColor : chartDownColor;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex gap-8">
        {/* Left Column: Charting & Main Insights */}
        <div className="flex-[2.5] flex flex-col gap-8">
          {/* Header Stack */}
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-4xl font-bold font-headline tracking-tight">NeuralSight AI Forecast</h2>
              <div className="flex items-center gap-4 mt-2">
                <span className="font-label px-3 py-1 bg-secondary/10 text-secondary rounded-full font-bold uppercase tracking-widest text-[10px]">Active Node: {selectedStock}_ALPHA_7</span>
                <span className="text-on-surface-variant text-xs">Confidence Score: <span className="text-on-surface font-black">{selectedPrediction.confidence.toFixed(1)}%</span></span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">Est. Weekly Move</p>
              <p className={`text-3xl font-bold font-headline ${selectedPrediction.isPositive ? 'text-secondary' : 'text-error'}`}>
                {selectedPrediction.gain > 0 ? '+' : ''}{selectedPrediction.gain.toFixed(2)}%
              </p>
            </div>
          </div>
          
          {/* Main Chart Card */}
          <div className="bg-surface-container-low rounded-xl p-8 relative overflow-hidden group border border-outline-variant/5 shadow-lg shadow-black/20">
            <div className="absolute top-0 right-0 p-4 flex gap-2">
              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                <div className="w-2 h-2 rounded-full bg-outline"></div> Historical
              </div>
              <div className="flex items-center gap-2 text-xs text-secondary">
                <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_#00e3fd] ${selectedPrediction.isPositive ? 'bg-secondary' : 'bg-error'}`}></div> Predicted
              </div>
            </div>
            <div className="h-96 w-full relative pt-12 text-xs">
              <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                          <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={chartColor} stopOpacity={0.4}/>
                              <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                          </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="label" stroke="#94a3b8" tick={{fill: '#94a3b8', fontSize: 10}} tickMargin={10} minTickGap={15} />
                      <YAxis stroke="#94a3b8" tick={{fill: '#94a3b8', fontSize: 10}} tickFormatter={(value) => formatPrice(value)} domain={['dataMin - 10', 'dataMax + 10']} />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: `1px solid ${chartColor}4d`, borderRadius: '8px', color: '#fff' }} formatter={(value: number) => [formatPrice(value), 'Price']} isAnimationActive={false} />
                      <Area type="monotone" dataKey="historicalValue" stroke="#a6abba" strokeWidth={2} strokeDasharray="4 4" fill="transparent" isAnimationActive={true} />
                      <Area type="monotone" dataKey="predictedValue" stroke={chartColor} strokeWidth={chartStrokeWidth} fill="url(#colorForecast)" isAnimationActive={true} />
                      <ReferenceLine x={`FRI 12, ${currentYear}`} stroke="#334155" strokeDasharray="3 3" label={{ position: 'top', value: 'PREDICTION', fill: '#94a3b8', fontSize: 10 }} />
                      <Brush dataKey="label" height={30} stroke={chartColor} fill="rgba(15, 23, 42, 0.8)" tickFormatter={() => ''} travellerWidth={10} />
                  </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Strategy Bento Row */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-surface-container-low rounded-xl p-6 border-l-2 border-primary/40 shadow-lg shadow-black/20">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-xs uppercase tracking-widest font-black text-on-surface-variant">Intraday</h4>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selectedPrediction.isPositive ? 'bg-secondary/10 text-secondary' : 'bg-error/10 text-error'}`}>
                  {selectedPrediction.isPositive ? 'Buy' : 'Sell'}
                </span>
              </div>
              <p className="text-2xl font-bold font-headline text-on-surface mb-1">
                {stockData?.current_price ? formatPrice(stockData.current_price * (1 + selectedPrediction.gain/100 * 0.2)) : '---'}
              </p>
              <p className="text-xs text-on-surface-variant">Target {selectedPrediction.isPositive ? 'resistance' : 'support'} ahead</p>
            </div>
            <div className="bg-surface-container-high rounded-xl p-6 border-l-2 border-secondary/40 shadow-lg shadow-black/20">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-xs uppercase tracking-widest font-black text-on-surface-variant">Short-Term</h4>
                <span className="text-[10px] font-bold text-secondary px-2 py-0.5 bg-secondary/10 rounded-full">Hold</span>
              </div>
              <p className="text-2xl font-bold font-headline text-on-surface mb-1">
                 {stockData?.current_price ? formatPrice(stockData.current_price * (1 + selectedPrediction.gain/100 * 0.5)) : '---'}
              </p>
              <p className="text-xs text-on-surface-variant">Awaiting EMA cross confirmation</p>
            </div>
            <div className="bg-surface-container-low rounded-xl p-6 border-l-2 border-tertiary/40 shadow-lg shadow-black/20">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-xs uppercase tracking-widest font-black text-on-surface-variant">Long-Term</h4>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selectedPrediction.action.includes('Buy') ? 'bg-secondary/10 text-secondary' : 'bg-error/10 text-error'}`}>
                   {selectedPrediction.action.includes('Buy') ? 'Accumulate' : 'Liquidate'}
                </span>
              </div>
              <p className="text-2xl font-bold font-headline text-on-surface mb-1">
                 {stockData?.current_price ? formatPrice(stockData.current_price * (1 + selectedPrediction.gain/100)) : '---'}
              </p>
              <p className="text-xs text-on-surface-variant">Portfolio rebalance suggested</p>
            </div>
          </div>
        </div>

        {/* Right Column: Trading & Execution */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Trade Calculator */}
          <div className="bg-[rgba(25,31,46,0.6)] backdrop-blur-xl rounded-xl p-6 border border-outline-variant/10 shadow-lg shadow-black/20">
            <h3 className="text-lg font-bold font-headline mb-6">Trade Synthesis</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-on-surface-variant block mb-2">Investment Amount</label>
                <div className="relative">
                  <input 
                    className="w-full bg-surface-container-highest border-none rounded-xl p-4 text-xl font-bold font-headline text-secondary outline-none focus:ring-1 focus:ring-secondary/50" 
                    type="number" 
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-xs uppercase">{formatPrice(1).replace(/[\d.,]/g, '')}</span>
                </div>
              </div>
              <div className="p-4 bg-surface-container-high rounded-xl">
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-on-surface-variant">Leverage Multiplier</span>
                  <span className="text-xs font-bold">5x (Neural-Adjusted)</span>
                </div>
                <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full w-[60%] shadow-[0_0_8px_#00e3fd]"></div>
                </div>
              </div>
              <div className="space-y-3 py-4">
                <div className="flex justify-between"><span className="text-sm text-on-surface-variant">Synthesized Entry</span><span className="text-sm font-bold">{stockData?.current_price ? formatPrice(stockData.current_price) : '---'}</span></div>
                <div className="flex justify-between"><span className="text-sm text-on-surface-variant">AI Stop Loss</span><span className="text-sm font-bold text-error">{stockData?.current_price ? formatPrice(stockData.current_price * (selectedPrediction.isPositive ? 0.95 : 1.05)) : '---'}</span></div>
                <div className="flex justify-between"><span className="text-sm text-on-surface-variant">Projected P/L</span><span className={`text-sm font-bold ${selectedPrediction.isPositive ? 'text-secondary' : 'text-error'}`}>{selectedPrediction.isPositive ? '+' : '-'}{formatPrice(investmentAmount * 5 * Math.abs(selectedPrediction.gain) / 100)}</span></div>
              </div>
              <button onClick={() => triggerTrade(selectedStock)} className="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary-container font-black uppercase tracking-widest text-sm rounded-full hover:shadow-[0_0_20px_rgba(137,172,255,0.4)] transition-all active:scale-95">
                Execute Order Cluster
              </button>
            </div>
          </div>

          {/* Market Intelligence Feed */}
          <div className="flex-1 bg-surface-container-low rounded-xl p-6 shadow-lg shadow-black/20">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-lg">psychology</span>
              Neural Feed
            </h3>
            <div className="space-y-6">
              <div className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-2 before:w-1 before:h-1 before:bg-secondary before:rounded-full">
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">14:02 PM • SEC_FILING</p>
                <p className="text-xs mt-1 leading-relaxed">Cluster analysis detects institutional accumulation at current level. Divergence confirmed.</p>
              </div>
              <div className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-2 before:w-1 before:h-1 before:bg-outline before:rounded-full">
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">13:45 PM • MACRO_ORACLE</p>
                <p className="text-xs mt-1 leading-relaxed">Sector sentiment shifting neutral. Exposure risk minimized by 4.2%.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NEW: Global Market AI Predictions */}
      <div className="mt-4">
        <h3 className="text-xl font-bold font-headline mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">memory</span>
          Global Neural Predictions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {availableStocks.map((stock) => {
            const pred = getPrediction(stock.ticker);
            const isSelected = stock.ticker === selectedStock;
            return (
              <div 
                key={stock.ticker} 
                onClick={() => setSelectedStock(stock.ticker)}
                className={`bg-surface-container p-5 rounded-xl cursor-pointer transition-all border ${isSelected ? 'border-secondary shadow-[0_0_15px_rgba(0,227,253,0.15)] bg-surface-container-low' : 'border-outline-variant/10 hover:border-secondary/30 hover:bg-surface-container-high'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-on-surface">{stock.ticker}</h4>
                    <p className="text-[10px] text-on-surface-variant truncate max-w-[100px]">{stock.name}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-md font-bold ${pred.color}`}>
                    {pred.action}
                  </span>
                </div>
                <div className="mt-4 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] uppercase font-label tracking-widest text-on-surface-variant">AI Target</p>
                    <p className={`font-bold ${pred.isPositive ? 'text-secondary' : 'text-error'}`}>
                      {pred.gain > 0 ? '+' : ''}{pred.gain.toFixed(2)}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-label tracking-widest text-on-surface-variant">Conf.</p>
                    <p className="font-bold text-on-surface">{pred.confidence.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
