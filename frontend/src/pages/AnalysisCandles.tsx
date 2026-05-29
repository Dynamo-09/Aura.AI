/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, ReferenceLine, Brush, Line } from 'recharts';
import type { OutletContextData } from '../components/Layout';

export default function AnalysisCandles() {
  const { stockData, selectedStock, availableStocks, chartColors, formatPrice } = useOutletContext<OutletContextData>();
  const [showIndicators, setShowIndicators] = useState(false);
  const [showAiOverlay, setShowAiOverlay] = useState(true);
  const [activeTimeframe, setActiveTimeframe] = useState('1D');

  const stockInfo = availableStocks.find(s => s.ticker === selectedStock) || { ticker: selectedStock, name: 'Unknown Asset' };

  const getDisplayData = () => {
    if (!stockData?.dashboard_data) return null;
    const baseData = [...stockData.dashboard_data];
    if (activeTimeframe === '1H') return baseData.slice(-12);
    if (activeTimeframe === '4H') return baseData.slice(-24);
    if (activeTimeframe === '1D') return baseData;
    if (activeTimeframe === '1W') {
        return baseData.filter((_, i) => i % 5 === 0);
    }
    return baseData;
  };

  const displayData = getDisplayData();

  const renderTimeframeBtn = (label: string) => {
    const isActive = activeTimeframe === label;
    return (
      <button 
        onClick={() => setActiveTimeframe(label)}
        className={`px-4 py-2 rounded-xl text-xs font-label uppercase tracking-widest transition-all shadow-sm border ${isActive ? 'bg-secondary/20 border-secondary/30 text-secondary shadow-[0_0_10px_rgba(0,227,253,0.2)]' : 'bg-surface-container-high border-transparent text-on-surface-variant hover:text-secondary hover:bg-surface-container-highest'}`}>
        {label}
      </button>
    );
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto w-full pt-16">
      {/* Header Section */}
      <section className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center space-x-4 mb-2">
            <h2 className="text-4xl font-bold font-headline tracking-tight">{stockInfo.name} <span className="text-secondary font-light">{stockInfo.ticker}</span></h2>
            <span className="px-3 py-1 bg-secondary-container/30 text-secondary text-[10px] font-label uppercase tracking-widest rounded-full shadow-[0_0_10px_rgba(0,227,253,0.1)]">NasdaqGS</span>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex flex-col">
              <span className="text-on-surface text-3xl font-bold font-headline drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]">
                {stockData?.current_price ? formatPrice(stockData.current_price) : '--'}
              </span>
              <span className="text-secondary text-sm font-medium flex items-center">
                <span className="material-symbols-outlined text-sm mr-1">trending_up</span> +2.34 (1.23%)
              </span>
            </div>
            <div className="hidden md:block h-10 w-[1px] bg-outline-variant/30"></div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1">
              <span className="text-on-surface-variant font-label text-[10px] uppercase">Market Cap</span>
              <span className="text-on-surface font-body text-xs font-semibold">2.98T</span>
              <span className="text-on-surface-variant font-label text-[10px] uppercase">Volume (24H)</span>
              <span className="text-on-surface font-body text-xs font-semibold">54.2M</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {renderTimeframeBtn('1H')}
          {renderTimeframeBtn('4H')}
          {renderTimeframeBtn('1D')}
          {renderTimeframeBtn('1W')}
          
          <button 
             onClick={() => setShowIndicators(!showIndicators)}
             className={`ml-2 px-4 py-2 rounded-xl text-xs font-label uppercase tracking-widest transition-all border shadow-sm ${showIndicators ? 'bg-secondary/20 border-secondary/30 text-secondary' : 'bg-surface-container-high border-transparent text-on-surface-variant hover:text-secondary'}`}>
             Indicators
          </button>
          <button 
             onClick={() => setShowAiOverlay(!showAiOverlay)}
             className={`px-4 py-2 rounded-xl text-xs font-label uppercase tracking-widest transition-all border shadow-sm ${showAiOverlay ? 'bg-primary/20 border-primary/30 text-primary' : 'bg-surface-container-high border-transparent text-on-surface-variant hover:text-primary'}`}>
             AI Overlay
          </button>
        </div>
      </section>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Main Chart Canvas */}
        <div className="col-span-12 lg:col-span-9 bg-surface-container-low rounded-xl relative overflow-hidden h-[600px] border border-outline-variant/10 shadow-2xl shadow-black/40">
          
          {/* Chart Header/Tools Overlay */}
          <div className="absolute top-4 left-4 z-10 flex space-x-3 pointer-events-none">
            {showIndicators && (
              <>
                <div className="flex items-center space-x-2 bg-surface-container-highest/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-outline-variant/10 shadow-lg">
                  <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_5px_#00e3fd]"></div>
                  <span className="text-[10px] font-label uppercase text-on-surface">Upper Band</span>
                </div>
                <div className="flex items-center space-x-2 bg-surface-container-highest/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-outline-variant/10 shadow-lg">
                  <div className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_5px_#a68cff]"></div>
                  <span className="text-[10px] font-label uppercase text-on-surface">Lower Band</span>
                </div>
              </>
            )}
            {showAiOverlay && (
              <div className="flex items-center gap-2 bg-surface-container-highest/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-outline-variant/10 shadow-lg pointer-events-auto">
                 <div className="w-2 h-2 rounded-full bg-[#ff716c] animate-pulse shadow-[0_0_4px_#ff716c]"></div>
                 <span className="text-[10px] font-label uppercase text-on-surface">AI Anomaly Overlay Active</span>
              </div>
            )}
          </div>

          <div className="w-full h-full p-4 pt-16 pb-6">
            {displayData ? (
              <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={displayData} margin={{ top: 20, right: 30, left: 40, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2636" vertical={false} opacity={0.5} />
                      <XAxis dataKey="label" stroke="#a6abba" fontSize={11} tickLine={false} axisLine={false} minTickGap={30} tickMargin={10} />
                      <YAxis domain={['auto', 'auto']} stroke="#a6abba" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => formatPrice(v)} tickMargin={10} orientation="right" />
                      
                      <Tooltip 
                          content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                  const d = payload[0].payload as { open: number; high: number; low: number; close: number; };
                                  return (
                                      <div className="bg-surface-container-highest/95 border border-outline-variant/20 p-3 rounded-xl shadow-2xl text-xs font-body flex flex-col space-y-1 backdrop-blur-md">
                                          <span className="text-on-surface-variant font-label uppercase tracking-widest text-[10px]">Open <span className="text-on-surface ml-2 font-bold">{formatPrice(d.open)}</span></span>
                                          <span className="text-on-surface-variant font-label uppercase tracking-widest text-[10px]">High <span className="text-on-surface ml-2 font-bold">{formatPrice(d.high)}</span></span>
                                          <span className="text-on-surface-variant font-label uppercase tracking-widest text-[10px]">Low <span className="text-on-surface ml-2 font-bold">{formatPrice(d.low)}</span></span>
                                          <span className="text-on-surface-variant font-label uppercase tracking-widest text-[10px]">Close <span className="text-on-surface ml-2 font-bold">{formatPrice(d.close)}</span></span>
                                      </div>
                                  )
                              }
                              return null;
                          }}
                          cursor={{ stroke: '#1f2636', strokeWidth: 1, strokeDasharray: '4 4' }}
                          isAnimationActive={false}
                      />

                      {/* Render OHLC bodies using Bar with custom shape */}
                      <Bar dataKey="close" maxBarSize={6} isAnimationActive={true} animationDuration={800} shape={(props: any) => {
                          const { x, y, width, height, payload } = props as { x: number, y: number, width: number, height: number, payload: { open: number, close: number } };
                          const isUp = payload.close >= payload.open;
                          
                          let fillUp = "#10b981"; // default green
                          let fillDown = "#ff716c"; // default red
                          
                          if (chartColors === 'colorblind') {
                              fillUp = '#5a90ff'; // blue
                              fillDown = '#ffb74d'; // orange
                          } else if (chartColors === 'neon') {
                              fillUp = '#00e3fd'; // cyan
                              fillDown = '#ff66cc'; // pink
                          }
                          
                          const fill = isUp ? fillUp : fillDown; 
                          // Height calculation for simple body approximation
                          const bodyY = isUp ? y : y - Math.max(2, (payload.open - payload.close)*5); 
                          const rectH = Math.max(2, Math.abs(height));
                          
                          return (
                              <g>
                                  {/* Wick (simplified) */}
                                  <line x1={x + width/2} y1={y - 10} x2={x + width/2} y2={y + rectH + 10} stroke={fill} strokeWidth={1} opacity={0.5} />
                                  {/* Body */}
                                  <rect x={x} y={bodyY} width={width} height={rectH} fill={fill} rx={1} />
                              </g>
                          );
                      }} />
                      
                      {/* Median AI Boundary */}
                      <ReferenceLine y={stockData?.median_average || 0} stroke="#a68cff" strokeDasharray="4 4" label={{ position: 'insideTopLeft', value: 'Neural Median Avg', fill: '#a68cff', fontSize: 10, offset: 15 }} />
                      <Brush dataKey="label" height={25} stroke="#00e3fd" fill="#090e19" travellerWidth={8} />

                      {showIndicators && (
                          <>
                             <Line type="monotone" dataKey="upper_band" stroke="#00e3fd" strokeWidth={1} dot={false} strokeDasharray="3 3" opacity={0.7} />
                             <Line type="monotone" dataKey="lower_band" stroke="#a68cff" strokeWidth={1} dot={false} strokeDasharray="3 3" opacity={0.7} />
                          </>
                      )}

                      {showAiOverlay && (
                          <Line type="monotone" dataKey="close" stroke="none" isAnimationActive={false} dot={(props: any) => {
                               const { cx, cy, payload } = props;
                               if (payload.is_anomaly) {
                                   return <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={5} fill="#ff716c" className="animate-pulse" style={{filter: 'drop-shadow(0 0 6px #ff716c)'}} />;
                               }
                               return <svg key={`${cx}-${cy}`}></svg>;
                          }} />
                      )}
                  </ComposedChart>
              </ResponsiveContainer>
            ) : (
               <div className="flex items-center justify-center h-full text-on-surface-variant font-bold text-xs uppercase tracking-widest animate-pulse">
                  Awaiting Stream...
               </div>
            )}
          </div>
        </div>

        {/* Analysis Sidebar */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          {/* Analysis Insights Card */}
          <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10 shadow-lg shadow-black/20">
            <h3 className="font-headline text-lg font-bold mb-4 flex items-center">
              <span className="material-symbols-outlined text-secondary mr-2" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              Analysis (Candles)
            </h3>
            <div className="space-y-4">
              <div className="bg-surface-container-high p-4 rounded-xl border border-outline-variant/5">
                <span className="text-[10px] font-label uppercase text-secondary tracking-widest block mb-1">Pattern Detected</span>
                <p className="font-body text-sm font-semibold">Bullish Engulfing</p>
                <p className="font-body text-[11px] text-on-surface-variant mt-2 leading-relaxed">Strong buying pressure confirmed at recent support. Probability of trend continuation is 78%.</p>
              </div>
              <div className="bg-surface-container-high p-4 rounded-xl border-l-4 border-error/50 shadow-inner">
                <span className="text-[10px] font-label uppercase text-error tracking-widest block mb-1">Resistance Zone</span>
                <p className="font-body text-sm font-semibold">Approaching Peak</p>
                <p className="font-body text-[11px] text-on-surface-variant mt-2 leading-relaxed">Historic selling volume noted at this peak. Watch for MACD divergence.</p>
              </div>
            </div>
          </div>

          {/* Sentiment Module */}
          <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10 shadow-lg shadow-black/20">
            <h4 className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-4">Neural Sentiment</h4>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold font-headline text-secondary drop-shadow-[0_0_5px_rgba(0,227,253,0.3)]">82%</span>
              <span className="text-[10px] font-label text-on-surface-variant uppercase">Greed Index</span>
            </div>
            <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-secondary to-primary" style={{ width: '82%' }}></div>
            </div>
            <p className="mt-4 text-[11px] text-on-surface-variant leading-tight">AI processed 4,200 social signals and news articles in the last 15 mins to synthesize this score.</p>
          </div>

          {/* Order Book Quick Look */}
          <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10 shadow-lg shadow-black/20">
            <h4 className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-4">Live Order Book</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-[11px] font-body">
                <span className="text-error">Asks Level 1</span>
                <span className="text-on-surface font-semibold">12,400</span>
              </div>
              <div className="flex justify-between text-[11px] font-body opacity-80">
                <span className="text-error">Asks Level 2</span>
                <span className="text-on-surface">8,100</span>
              </div>
              <div className="h-[1px] bg-outline-variant/10 my-2"></div>
              <div className="flex justify-between text-[11px] font-body">
                <span className="text-secondary">Bids Level 1</span>
                <span className="text-on-surface font-semibold">15,200</span>
              </div>
              <div className="flex justify-between text-[11px] font-body opacity-80">
                <span className="text-secondary">Bids Level 2</span>
                <span className="text-on-surface">9,450</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
