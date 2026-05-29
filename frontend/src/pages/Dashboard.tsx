/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Brush } from 'recharts';
import type { OutletContextData } from '../components/Layout';

function Sparkline({ data, color }: { data: any[], color: string }) {
   if (!data || data.length === 0) return null;
   const min = Math.min(...data.map(d => d.value));
   const max = Math.max(...data.map(d => d.value));
   const range = max - min || 1;
   const points = data.map((d, i) => {
       const x = (i / (data.length - 1)) * 100;
       const y = 18 - ((d.value - min) / range) * 16;
       return `${x},${y}`;
   }).join(' L ');
   return (
       <svg className="w-full h-full preserve-3d" viewBox="0 0 100 20" preserveAspectRatio="none">
           <path d={`M ${points}`} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
       </svg>
   );
}

export default function Dashboard() {
  const { stockData, portfolioData, dashboardSummary, setSelectedStock, fetchStockSpecificData, chartColors, formatPrice } = useOutletContext<OutletContextData>();
  
  // Chart color logic
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
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<'1D' | '1W' | '1M'>('1M');

  // Use dynamic indices for NIFTY 50 and BTC/USD cards if available, else fallback to mock
  const niftyData = dashboardSummary?.indices?.find((i: any) => i.name === 'NIFTY 50');
  const btcData = dashboardSummary?.indices?.find((i: any) => i.name === 'Bitcoin' || i.name === 'BTC/USD');

  // Compute a mock value based on stock current price for display
  const priceValue = stockData?.current_price || 64821.50;

  let chartData = stockData?.dashboard_data || [];
  if (timeRange === '1D') chartData = chartData.slice(-2);
  else if (timeRange === '1W') chartData = chartData.slice(-7);
  else if (timeRange === '1M') chartData = chartData.slice(-30);

  return (
    <div className="space-y-8">
      {/* Hero Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* NIFTY 50 */}
        <div className="bg-surface-container-low p-6 rounded-xl relative overflow-hidden group hover:bg-surface-container-high transition-colors shadow-lg shadow-black/20">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[10px] font-label uppercase tracking-widest text-[#a6abba]">NIFTY 50 Index</p>
            <span className={niftyData?.change >= 0 ? "text-[#00e3fd] text-xs font-bold" : "text-[#ff716c] text-xs font-bold"}>
              {niftyData ? `${niftyData.change >= 0 ? '+' : ''}${niftyData.change}%` : '+1.24%'}
            </span>
          </div>
          <h3 className="text-2xl font-headline font-bold text-on-surface">
            {niftyData ? formatPrice(niftyData.price) : formatPrice(19435.30)}
          </h3>
          <div className="mt-4 h-12 w-full overflow-hidden opacity-50 group-hover:opacity-100 transition-opacity">
            {niftyData?.data ? (
              <Sparkline data={niftyData.data} color={chartUpColor} />
            ) : (
              <svg className="w-full h-full preserve-3d" viewBox="0 0 100 20">
                  <path d="M0 15 Q 10 10, 20 12 T 40 8 T 60 12 T 80 5 T 100 10" fill="none" stroke={chartUpColor} strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
              </svg>
            )}
          </div>
        </div>

        {/* BTC/USD */}
        <div className="bg-surface-container-low p-6 rounded-xl relative overflow-hidden group hover:bg-surface-container-high transition-colors shadow-lg shadow-black/20">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[10px] font-label uppercase tracking-widest text-[#a6abba]">Bitcoin / USD</p>
            <span className={btcData?.change >= 0 ? "text-[#00e3fd] text-xs font-bold" : "text-[#ff716c] text-xs font-bold"}>
               {btcData ? `${btcData.change >= 0 ? '+' : ''}${btcData.change}%` : '-0.82%'}
            </span>
          </div>
          <h3 className="text-2xl font-headline font-bold text-on-surface">
            {btcData ? formatPrice(btcData.price) : formatPrice(64281.90)}
          </h3>
          <div className="mt-4 h-12 w-full overflow-hidden opacity-50 group-hover:opacity-100 transition-opacity">
            {btcData?.data ? (
              <Sparkline data={btcData.data} color={chartDownColor} />
            ) : (
              <svg className="w-full h-full preserve-3d" viewBox="0 0 100 20">
                  <path d="M0 5 Q 15 15, 30 10 T 50 15 T 75 8 T 100 12" fill="none" stroke={chartDownColor} strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
              </svg>
            )}
          </div>
        </div>

        {/* AI SENTIMENT */}
        <div className="bg-surface-container-low p-6 rounded-xl relative overflow-hidden group hover:bg-surface-container-high transition-colors shadow-lg shadow-black/20">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[10px] font-label uppercase tracking-widest text-[#a6abba]">Oracle Sentiment</p>
            <span className="text-[#00e3fd] text-xs font-bold">{stockData?.strategies?.long_term?.action === 'Buy' ? 'Bullish' : stockData?.strategies?.long_term?.action === 'Sell' ? 'Bearish' : 'Neutral'}</span>
          </div>
          <h3 className="text-2xl font-headline font-bold text-on-surface">{portfolioData?.risk_score ? Math.round(portfolioData.risk_score * 10) : 82} / 100</h3>
          <div className="mt-4 flex items-end gap-1 h-12">
            <div className="w-2 bg-secondary/20 h-4 rounded-sm"></div>
            <div className="w-2 bg-secondary/30 h-6 rounded-sm"></div>
            <div className="w-2 bg-secondary/50 h-9 rounded-sm"></div>
            <div className="w-2 bg-secondary/70 h-11 rounded-sm"></div>
            <div className="w-2 bg-secondary h-12 rounded-sm shadow-[0_0_8px_#00e3fd]"></div>
          </div>
        </div>

        {/* TOTAL EQUITY */}
        <div className="bg-surface-container-low p-6 rounded-xl relative overflow-hidden group hover:bg-surface-container-high transition-colors shadow-lg shadow-black/20">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[10px] font-label uppercase tracking-widest text-[#a6abba]">Portfolio Value</p>
            <span className="material-symbols-outlined text-[#89acff] text-sm">trending_up</span>
          </div>
          <h3 className="text-2xl font-headline font-bold text-on-surface">
            {portfolioData?.portfolio_data ? formatPrice(portfolioData.portfolio_data.reduce((acc: number, cur: any) => acc + (cur.value as number), 0)) : formatPrice(2410294)}
          </h3>
          <p className="text-[10px] text-on-surface-variant mt-2 tracking-wide">+ {formatPrice(12400)} Today</p>
        </div>
      </div>

      {/* Main Interactive Chart Section */}
      <section className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 bg-surface-container-low rounded-xl p-8 relative overflow-hidden min-h-[400px] flex flex-col shadow-lg shadow-black/20">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-headline font-bold text-on-surface">Simple Price Trend</h2>
              <p className="text-sm text-[#a6abba]">Live AI synthesized data stream</p>
            </div>
            <div className="flex gap-2 bg-surface-container-highest p-1 rounded-full">
              <button onClick={() => setTimeRange('1D')} className={`px-4 py-1.5 text-[10px] font-bold rounded-full shadow-lg transition-colors ${timeRange === '1D' ? 'bg-secondary text-on-secondary' : 'text-[#a6abba] hover:text-on-surface'}`}>1D</button>
              <button onClick={() => setTimeRange('1W')} className={`px-4 py-1.5 text-[10px] font-bold rounded-full shadow-lg transition-colors ${timeRange === '1W' ? 'bg-secondary text-on-secondary' : 'text-[#a6abba] hover:text-on-surface'}`}>1W</button>
              <button onClick={() => setTimeRange('1M')} className={`px-4 py-1.5 text-[10px] font-bold rounded-full shadow-lg transition-colors ${timeRange === '1M' ? 'bg-secondary text-on-secondary' : 'text-[#a6abba] hover:text-on-surface'}`}>1M</button>
            </div>
          </div>
          
          <div className="flex-1 w-full bg-gradient-to-b from-secondary/10 to-transparent rounded-xl border border-outline-variant/10 relative p-4">
            {stockData?.dashboard_data ? (
              <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                      <defs>
                          <linearGradient id="colorDashboardPrice" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={chartUpColor} stopOpacity={0.4}/>
                              <stop offset="95%" stopColor={chartUpColor} stopOpacity={0}/>
                          </linearGradient>
                      </defs>
                      <XAxis dataKey="label" stroke="#94a3b8" tick={{fill: '#94a3b8', fontSize: 10}} tickMargin={10} minTickGap={20} />
                      <YAxis stroke="#94a3b8" tick={{fill: '#94a3b8', fontSize: 10}} tickFormatter={(value) => formatPrice(value)} domain={['auto', 'auto']} orientation="right" />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(25, 31, 46, 0.9)', border: `1px solid ${chartUpColor}4d`, borderRadius: '8px', color: '#fff' }} formatter={(value: number) => [formatPrice(value), 'Price']} isAnimationActive={false} />
                      <Area type="monotone" dataKey="value" stroke={chartUpColor} strokeWidth={chartStrokeWidth} fill="url(#colorDashboardPrice)" isAnimationActive={true} />
                      <Brush dataKey="label" height={30} stroke={chartUpColor} fill="rgba(15, 23, 42, 0.8)" tickFormatter={() => ''} travellerWidth={10} />
                  </AreaChart>
              </ResponsiveContainer>
            ) : (
               <div className="flex items-center justify-center h-full">Loading Chart...</div>
            )}
             {/* Simulated glass-panel Tooltip for design flair if you want */}
             {!stockData && (
                <div className="absolute top-[30%] left-[58%] glass-panel p-3 rounded-lg border border-secondary/30 shadow-2xl z-20">
                <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Active Pulse</p>
                <p className="text-lg font-headline font-bold text-on-surface">{formatPrice(priceValue)}</p>
                </div>
             )}
          </div>
        </div>

        {/* AI Market Scanner Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface-container-low rounded-xl p-6 h-full flex flex-col shadow-lg shadow-black/20 border border-outline-variant/5">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-[#00e3fd]">auto_awesome</span>
              <h2 className="font-headline font-bold text-on-surface">Market Signals</h2>
            </div>
            
            <div className="flex-1 space-y-4">
              <div onClick={() => { setSelectedStock(stockData?.stock_name || 'AAPL'); fetchStockSpecificData(stockData?.stock_name || 'AAPL'); }} className="p-4 rounded-lg bg-surface-container-highest border-l-2 border-secondary group hover:scale-[1.02] transition-transform cursor-pointer">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-on-surface">{stockData?.stock_name || 'AAPL / USD'}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-secondary/10 text-secondary">{stockData?.strategies?.short_term?.action?.toUpperCase() || 'BUY'}</span>
                </div>
                <p className="text-xs text-[#a6abba] line-clamp-2">{stockData?.strategies?.short_term?.description || 'High probability breakout detected on 15m timeframe.'}</p>
              </div>

              <div onClick={() => { setSelectedStock('NVDA'); fetchStockSpecificData('NVDA'); }} className="p-4 rounded-lg bg-surface-container-highest border-l-2 border-primary group hover:scale-[1.02] transition-transform cursor-pointer">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-on-surface">NVDA / USD</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary">HOLD</span>
                </div>
                <p className="text-xs text-[#a6abba] line-clamp-2">Consolidation pattern forming. Awaiting volume confirmation for next move.</p>
              </div>

              <div onClick={() => { setSelectedStock('TSLA'); fetchStockSpecificData('TSLA'); }} className="p-4 rounded-lg bg-surface-container-highest border-l-2 border-error group hover:scale-[1.02] transition-transform cursor-pointer">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-on-surface">TSLA / USD</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-error/10 text-error">SELL</span>
                </div>
                <p className="text-xs text-[#a6abba] line-clamp-2">Negative divergence on RSI. AI predicts short-term correction to 215.00.</p>
              </div>
            </div>
            
            <div className="mt-8">
              <button onClick={() => navigate('/ai-scanner')} className="w-full py-3 rounded-xl border border-outline-variant/20 hover:border-secondary/50 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant transition-all hover:text-white hover:bg-surface-container-highest">
                View All Scanner Data
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Data Layer: Recent Activities & Heatmap */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-surface-container-low rounded-xl p-8 overflow-hidden shadow-lg shadow-black/20 border border-outline-variant/5">
          <h3 className="text-lg font-headline font-bold text-on-surface mb-6">Execution Log</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-label uppercase tracking-widest text-[#a6abba] border-b border-outline-variant/10">
                  <th className="pb-4 font-normal">Asset</th>
                  <th className="pb-4 font-normal">Action</th>
                  <th className="pb-4 font-normal">Amount</th>
                  <th className="pb-4 font-normal text-right">Status</th>
                </tr>
              </thead>
              <tbody className="text-xs text-on-surface">
                <tr className="border-b border-outline-variant/5">
                  <td className="py-4 font-bold">BTC</td>
                  <td className="py-4 text-[#00e3fd]">Limit Buy</td>
                  <td className="py-4">{formatPrice(42000)}</td>
                  <td className="py-4 text-right">
                    <span className="bg-surface-container-highest border border-outline-variant/10 px-3 py-1 rounded-full text-[10px]">Filled</span>
                  </td>
                </tr>
                <tr className="border-b border-outline-variant/5">
                  <td className="py-4 font-bold">NVDA</td>
                  <td className="py-4 text-[#ff716c]">Market Sell</td>
                  <td className="py-4">{formatPrice(15400)}</td>
                  <td className="py-4 text-right">
                    <span className="bg-surface-container-highest border border-outline-variant/10 px-3 py-1 rounded-full text-[10px]">Pending</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 font-bold">SOL</td>
                  <td className="py-4 text-[#00e3fd]">Limit Buy</td>
                  <td className="py-4">{formatPrice(8200)}</td>
                  <td className="py-4 text-right">
                    <span className="bg-surface-container-highest border border-outline-variant/10 px-3 py-1 rounded-full text-[10px]">Filled</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-xl p-8 relative overflow-hidden flex flex-col shadow-lg shadow-black/20 border border-outline-variant/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="flex justify-between items-center mb-6 z-10">
            <h3 className="text-lg font-headline font-bold text-on-surface">Global Correlation</h3>
            <span className="material-symbols-outlined text-[#a6abba]">hub</span>
          </div>
          <div className="flex-1 grid grid-cols-4 grid-rows-3 gap-2 z-10">
            <div className="bg-secondary/80 rounded-lg flex items-center justify-center text-[10px] font-bold text-on-secondary">USDT</div>
            <div className="bg-secondary/60 rounded-lg"></div>
            <div className="bg-secondary/40 rounded-lg"></div>
            <div className="bg-secondary/20 rounded-lg"></div>
            <div className="bg-secondary/50 rounded-lg"></div>
            <div className="bg-secondary/90 rounded-lg flex items-center justify-center text-[10px] font-bold text-on-secondary">ETH</div>
            <div className="bg-secondary/30 rounded-lg"></div>
            <div className="bg-primary/20 rounded-lg"></div>
            <div className="bg-secondary/20 rounded-lg"></div>
            <div className="bg-secondary/10 rounded-lg"></div>
            <div className="bg-primary/40 rounded-lg flex items-center justify-center text-[10px] font-bold text-on-primary">XRP</div>
            <div className="bg-secondary/70 rounded-lg"></div>
          </div>
          <div className="mt-6 flex items-center gap-4 z-10">
            <span className="text-[10px] text-[#a6abba]">Correlation Strength:</span>
            <div className="flex-1 h-1 bg-surface-container-highest rounded-full overflow-hidden">
              <div className="w-[78%] h-full bg-secondary shadow-[0_0_8px_#00e3fd]"></div>
            </div>
            <span className="text-[10px] font-bold text-on-surface">78%</span>
          </div>
        </div>
      </div>
    </div>
  );
}