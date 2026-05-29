import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { OutletContextData } from '../components/Layout';

export default function Portfolio() {
  const { portfolioData, formatPrice } = useOutletContext<OutletContextData>();
  const [timeframe, setTimeframe] = useState<'Daily' | 'Weekly'>('Daily');

  const heatmapData = {
    Daily: { it: '+4.8%', banking: '+1.2%', pharma: '-3.1%', energy: '+0.4%', consumer: '-2.45%', metals: '+2.1%', volText: '24H Volatility Heatmap' },
    Weekly: { it: '+12.4%', banking: '-2.1%', pharma: '-5.8%', energy: '+3.2%', consumer: '+1.1%', metals: '+6.4%', volText: '7D Volatility Heatmap' }
  };
  const currentHeatmap = heatmapData[timeframe];

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full">
      {/* Hero Header Section */}
      <section className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
        <div>
          <h2 className="text-[3.5rem] font-headline font-bold leading-none tracking-tight text-on-surface mb-2 drop-shadow-[0_0_15px_rgba(137,172,255,0.2)]">
            {formatPrice(142849.25)}
          </h2>
          <div className="flex items-center gap-4">
            <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Active Portfolio Value</span>
            <div className="flex items-center text-secondary text-sm font-bold">
              <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
              +12.4% <span className="ml-2 font-normal text-on-surface-variant/60 font-body">(Today)</span>
            </div>
          </div>
        </div>
        <div className="bg-surface-container-low p-6 rounded-xl border-l-4 border-secondary flex items-center gap-6 shadow-lg shadow-black/20">
          <div className="relative w-16 h-16">
            <svg className="w-full h-full transform -rotate-90">
              <circle className="text-surface-container-highest" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="4"></circle>
              <circle className="text-secondary drop-shadow-[0_0_5px_#00e3fd]" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeDasharray="175" strokeDashoffset="140" strokeWidth="4"></circle>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-headline font-bold text-xl text-secondary">{portfolioData?.risk_score || 4.2}</div>
          </div>
          <div>
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Portfolio Risk Score</p>
            <p className="font-headline text-lg font-bold text-on-surface">ULTRA CONSERVATIVE</p>
            <p className="text-xs text-on-surface-variant max-w-[180px]">Your strategy is 92% aligned with capital preservation goals.</p>
          </div>
        </div>
      </section>

      {/* Main Intelligence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Asset Distribution Chart */}
        <div className="lg:col-span-5 bg-surface-container-low p-8 rounded-xl relative overflow-hidden group shadow-lg shadow-black/20 border border-outline-variant/10">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h3 className="font-headline text-xl font-bold text-on-surface">AI Portfolio Optimizer</h3>
              <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Asset Class Weights</p>
            </div>
            <span className="material-symbols-outlined text-secondary opacity-50 group-hover:opacity-100 transition-opacity drop-shadow-[0_0_5px_#00e3fd]">auto_awesome</span>
          </div>
          <div className="relative h-64 w-64 mx-auto mb-10">
            <div className="absolute inset-0 rounded-full border-[16px] border-surface-container-highest shadow-inner"></div>
            <div className="absolute inset-0 rounded-full border-[16px] border-t-secondary border-r-primary border-b-tertiary border-l-transparent rotate-45 drop-shadow-[0_0_10px_rgba(0,227,253,0.3)]"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <p className="font-headline text-3xl font-bold text-on-surface">12</p>
              <p className="font-label text-[9px] uppercase tracking-tighter text-on-surface-variant">Unique Assets</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_5px_#00e3fd]"></span><span className="font-body text-sm text-on-surface">NVIDIA CORP</span></div>
              <span className="font-headline text-sm font-bold text-on-surface">24.5%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_5px_#89acff]"></span><span className="font-body text-sm text-on-surface">APPLE INC</span></div>
              <span className="font-headline text-sm font-bold text-on-surface">18.2%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_5px_#a68cff]"></span><span className="font-body text-sm text-on-surface">MICROSOFT</span></div>
              <span className="font-headline text-sm font-bold text-on-surface">15.8%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-surface-container-highest"></span><span className="font-body text-sm text-on-surface-variant">OTHERS</span></div>
              <span className="font-headline text-sm font-bold text-on-surface-variant">41.5%</span>
            </div>
          </div>
        </div>

        {/* Sector Performance Heatmap */}
        <div className="lg:col-span-7 bg-surface-container-low p-8 rounded-xl shadow-lg shadow-black/20 border border-outline-variant/10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="font-headline text-xl font-bold text-on-surface">Sector Performance</h3>
              <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">{currentHeatmap.volText}</p>
            </div>
            <div className="flex items-center gap-2 bg-surface-container-highest p-1 rounded-full">
              <button onClick={() => setTimeframe('Daily')} className={`px-3 py-1 text-[10px] font-label uppercase rounded-full transition-colors ${timeframe === 'Daily' ? 'bg-surface-container-high text-secondary shadow-sm drop-shadow-md' : 'text-on-surface-variant hover:text-on-surface'}`}>Daily</button>
              <button onClick={() => setTimeframe('Weekly')} className={`px-3 py-1 text-[10px] font-label uppercase rounded-full transition-colors ${timeframe === 'Weekly' ? 'bg-surface-container-high text-secondary shadow-sm drop-shadow-md' : 'text-on-surface-variant hover:text-on-surface'}`}>Weekly</button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-[440px]">
            {/* IT */}
            <div className={`col-span-2 row-span-2 border rounded-xl p-6 flex flex-col justify-between group transition-all cursor-pointer ${currentHeatmap.it.startsWith('+') ? 'bg-secondary/10 border-secondary/20 hover:bg-secondary/20 hover:shadow-[0_0_15px_rgba(0,227,253,0.1)]' : 'bg-error/10 border-error/20 hover:bg-error/20'}`}>
              <div className="flex justify-between items-start">
                <span className={`font-headline font-bold text-2xl ${currentHeatmap.it.startsWith('+') ? 'text-secondary drop-shadow-[0_0_5px_#00e3fd]' : 'text-error drop-shadow-[0_0_5px_#ff453a]'}`}>IT</span>
                <span className={`material-symbols-outlined ${currentHeatmap.it.startsWith('+') ? 'text-secondary' : 'text-error'}`}>{currentHeatmap.it.startsWith('+') ? 'north_east' : 'south_east'}</span>
              </div>
              <div>
                <p className="text-4xl font-headline font-bold text-on-surface mb-1">{currentHeatmap.it}</p>
                <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Market Leader</p>
              </div>
            </div>
            {/* Banking */}
            <div className={`border rounded-xl p-4 flex flex-col justify-between transition-all cursor-pointer ${currentHeatmap.banking.startsWith('+') ? 'bg-primary/5 border-primary/20 hover:bg-primary/10' : 'bg-error/10 border-error/20 hover:bg-error/20'}`}>
              <span className={`font-headline font-bold text-lg ${currentHeatmap.banking.startsWith('+') ? 'text-primary' : 'text-error'}`}>BANKING</span>
              <div><p className="text-xl font-headline font-bold text-on-surface">{currentHeatmap.banking}</p></div>
            </div>
            {/* Pharma */}
            <div className={`border rounded-xl p-4 flex flex-col justify-between transition-all cursor-pointer ${currentHeatmap.pharma.startsWith('+') ? 'bg-primary/5 border-primary/20 hover:bg-primary/10' : 'bg-error/10 border-error/20 hover:bg-error/20'}`}>
              <span className={`font-headline font-bold text-lg ${currentHeatmap.pharma.startsWith('+') ? 'text-primary' : 'text-error'}`}>PHARMA</span>
              <div><p className="text-xl font-headline font-bold text-on-surface">{currentHeatmap.pharma}</p></div>
            </div>
            {/* Energy */}
            <div className={`border rounded-xl p-4 flex flex-col justify-between transition-all cursor-pointer ${currentHeatmap.energy.startsWith('+') ? 'bg-primary/5 border-primary/20 hover:bg-primary/10' : 'bg-surface-container-highest border-outline-variant/10 hover:bg-surface-container-highest/80'}`}>
              <span className={`font-headline font-bold text-lg ${currentHeatmap.energy.startsWith('+') ? 'text-primary' : 'text-on-surface'}`}>ENERGY</span>
              <div><p className="text-xl font-headline font-bold text-on-surface">{currentHeatmap.energy}</p></div>
            </div>
            {/* Consumer */}
            <div className={`col-span-2 border rounded-xl p-4 flex flex-col justify-between transition-all cursor-pointer ${currentHeatmap.consumer.startsWith('+') ? 'bg-primary/5 border-primary/20 hover:bg-primary/10' : 'bg-error/10 border-error/20 hover:bg-error/20'}`}>
              <div className="flex justify-between items-center">
                <span className={`font-headline font-bold text-lg ${currentHeatmap.consumer.startsWith('+') ? 'text-primary' : 'text-error'}`}>CONSUMER GOODS</span>
                <span className="text-xl font-headline font-bold text-on-surface">{currentHeatmap.consumer}</span>
              </div>
            </div>
            {/* Metals */}
            <div className={`border rounded-xl p-4 flex flex-col justify-between transition-all cursor-pointer ${currentHeatmap.metals.startsWith('+') ? 'bg-primary/5 border-primary/20 hover:bg-primary/10' : 'bg-error/10 border-error/20 hover:bg-error/20'}`}>
              <span className={`font-headline font-bold text-lg ${currentHeatmap.metals.startsWith('+') ? 'text-primary' : 'text-error'}`}>METALS</span>
              <div><p className="text-xl font-headline font-bold text-on-surface">{currentHeatmap.metals}</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent AI Insights (Editorial Pattern) */}
      <section className="mt-12">
        <h3 className="font-headline text-sm uppercase tracking-[0.3em] text-on-surface-variant mb-6">Synthesized Signals</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-container-low p-6 rounded-xl relative overflow-hidden group border border-outline-variant/10 shadow-lg shadow-black/20">
            <div className="absolute top-0 right-0 p-4 opacity-10"><span className="material-symbols-outlined text-6xl">bolt</span></div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_5px_#00e3fd]"></span>
              <span className="font-label text-[10px] uppercase tracking-widest text-secondary font-bold">High Probability</span>
            </div>
            <h4 className="font-headline text-lg font-bold text-on-surface mb-3">Rebalance Trigger: Auto Sector</h4>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-6">AI scanner detects massive liquidity inflow into EV-related stocks. Consider moving 4% from Metals to Auto-OEMs.</p>
            <button className="text-xs font-bold text-secondary flex items-center gap-2 group-hover:gap-3 transition-all hover:drop-shadow-[0_0_5px_#00e3fd]">
              EXECUTE REBALANCE <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
          <div className="bg-surface-container-low p-6 rounded-xl relative overflow-hidden group border border-outline-variant/10 shadow-lg shadow-black/20">
            <div className="absolute top-0 right-0 p-4 opacity-10"><span className="material-symbols-outlined text-6xl">shield</span></div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_5px_#89acff]"></span>
              <span className="font-label text-[10px] uppercase tracking-widest text-primary font-bold">Risk Mitigation</span>
            </div>
            <h4 className="font-headline text-lg font-bold text-on-surface mb-3">Hedge Opportunity: Gold ETF</h4>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-6">Global volatility index (VIX) up 12%. Protecting your Pharma downside with a 5% allocation in Aura Gold Core.</p>
            <button className="text-xs font-bold text-primary flex items-center gap-2 group-hover:gap-3 transition-all hover:drop-shadow-[0_0_5px_#89acff]">
              VIEW PROTECTION PLAN <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
          <div className="bg-surface-container-low p-6 rounded-xl relative overflow-hidden group border border-outline-variant/10 shadow-lg shadow-black/20">
            <div className="absolute top-0 right-0 p-4 opacity-10"><span className="material-symbols-outlined text-6xl">visibility</span></div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_5px_#a68cff]"></span>
              <span className="font-label text-[10px] uppercase tracking-widest text-tertiary font-bold">Portfolio Pulse</span>
            </div>
            <h4 className="font-headline text-lg font-bold text-on-surface mb-3">Yield Harvest Available</h4>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-6">Current dividend yields on your Energy holdings exceed quarterly projections. Reinvestment recommended.</p>
            <button className="text-xs font-bold text-tertiary flex items-center gap-2 group-hover:gap-3 transition-all hover:drop-shadow-[0_0_5px_#a68cff]">
              REVIEW HARVEST <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
