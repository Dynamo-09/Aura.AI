import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import VoiceAssistant from './VoiceAssistant';
import Walkthrough from './Walkthrough';
import profilePic from '../assets/profile.jpg';

/* --- Duplicate interfaces for simplicity --- */
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface StockData {
    status: string;
    stock_name: string;
    median_average: number;
    dashboard_data: Array<any>;
    prediction_data: Array<any>;
    neural_data: any;
    current_price: number;
    strategies: any;
}
export interface PortfolioData {
    status: string;
    portfolio_data: Array<any>;
    optimizer_data: Array<any>;
    top_cards: any;
    risk_score: number;
}
export interface DashboardSummary {
    status: string;
    top_cards: any;
    indices: Array<any>;
}

export interface OutletContextData {
    stockData: StockData | null;
    portfolioData: PortfolioData | null;
    dashboardSummary: DashboardSummary | null;
    availableStocks: Array<{ticker: string, name: string}>;
    selectedStock: string;
    setSelectedStock: (s: string) => void;
    fetchStockSpecificData: (stock: string) => void;
    currency: string;
    setCurrency: (c: string) => void;
    formatPrice: (value: number) => string;
    triggerTrade: (asset: string) => void;
    userName: string;
    setUserName: (name: string) => void;
    email: string;
    setEmail: (email: string) => void;
    profilePicUrl: string;
    setProfilePicUrl: (url: string) => void;
    theme: string;
    setTheme: (t: string) => void;
    chartColors: string;
    setChartColors: (c: string) => void;
    voiceFeedback: boolean;
    setVoiceFeedback: (v: boolean) => void;
    voiceType: string;
    setVoiceType: (v: string) => void;
    defaultMarket: string;
    setDefaultMarket: (m: string) => void;
    defaultIndicators: string[];
    setDefaultIndicators: (i: string[]) => void;
    refreshRate: string;
    setRefreshRate: (r: string) => void;
    aiModel: string;
    setAiModel: (m: string) => void;
}

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  const [appState, setAppState] = useState<'SCANNING' | 'ACTIVE'>('SCANNING');
  const [availableStocks, setAvailableStocks] = useState<Array<{ticker: string, name: string}>>([]);
  const [selectedStock, setSelectedStock] = useState<string>('');
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutWarning, setShowLogoutWarning] = useState(false);
  
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);
  
  const [currency, setCurrency] = useState(() => localStorage.getItem('currency') || 'USD');
  const [userName, setUserName] = useState(() => localStorage.getItem('userName') || 'Pratyay Banerjee');
  const [email, setEmail] = useState(() => localStorage.getItem('email') || 'user@aura.ai');
  const [profilePicUrl, setProfilePicUrl] = useState(() => localStorage.getItem('profilePicUrl') || profilePic);

  const CURRENCY_RATES: Record<string, { symbol: string; rate: number }> = {
    'USD': { symbol: '$', rate: 1 },
    'INR': { symbol: '₹', rate: 83.2 },
    'EURO': { symbol: '€', rate: 0.92 },
    'POUND': { symbol: '£', rate: 0.79 },
    'Hong Kong Dollar': { symbol: 'HK$', rate: 7.82 },
    'Australian Dollar': { symbol: 'A$', rate: 1.52 },
  };

  const formatPrice = (value: number) => {
    const rateObj = CURRENCY_RATES[currency] || CURRENCY_RATES['USD'];
    return `${rateObj.symbol}${(value * rateObj.rate).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  };
  
  // Settings States
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [chartColors, setChartColors] = useState(() => localStorage.getItem('chartColors') || 'standard');
  const [voiceFeedback, setVoiceFeedback] = useState(() => {
    const val = localStorage.getItem('voiceFeedback');
    return val !== null ? val === 'true' : true;
  });
  const [voiceType, setVoiceType] = useState(() => localStorage.getItem('voiceType') || 'female-en-in');
  const [defaultMarket, setDefaultMarket] = useState(() => localStorage.getItem('defaultMarket') || 'nasdaq');
  const [defaultIndicators, setDefaultIndicators] = useState<string[]>(() => {
    const val = localStorage.getItem('defaultIndicators');
    return val ? JSON.parse(val) : ['rsi', 'macd'];
  });
  const [refreshRate, setRefreshRate] = useState(() => localStorage.getItem('refreshRate') || 'realtime');
  const [aiModel, setAiModel] = useState(() => localStorage.getItem('aiModel') || 'oracle-v4');

  useEffect(() => {
    localStorage.setItem('currency', currency);
    localStorage.setItem('userName', userName);
    localStorage.setItem('email', email);
    localStorage.setItem('profilePicUrl', profilePicUrl);
    localStorage.setItem('theme', theme);
    localStorage.setItem('chartColors', chartColors);
    localStorage.setItem('voiceFeedback', String(voiceFeedback));
    localStorage.setItem('voiceType', voiceType);
    localStorage.setItem('defaultMarket', defaultMarket);
    localStorage.setItem('defaultIndicators', JSON.stringify(defaultIndicators));
    localStorage.setItem('refreshRate', refreshRate);
    localStorage.setItem('aiModel', aiModel);
  }, [currency, userName, email, profilePicUrl, theme, chartColors, voiceFeedback, voiceType, defaultMarket, defaultIndicators, refreshRate, aiModel]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [tradeMessage, setTradeMessage] = useState('');

  const triggerTrade = (asset: string) => {
      setTradeMessage(`Executing trade for ${asset}...`);
      setTimeout(() => setTradeMessage(`Trade for ${asset} executed successfully.`), 1500);
      setTimeout(() => setTradeMessage(''), 4500);
  };

  const filteredStocks = availableStocks.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.ticker.toLowerCase().includes(searchQuery.toLowerCase()));

  /* ---------------- API CALLS ---------------- */
  const fetchPortfolioData = async () => {
      try {
          const res = await fetch('/api/portfolio');
          if (res.ok) setPortfolioData(await res.json());
      } catch (e) {
          // Add mock for UI design if api fails
          setPortfolioData({
             status: 'ok',
             portfolio_data: [ {name: 'Technology', value: 450000}, {name: 'Healthcare', value: 320000} ],
             optimizer_data: [ {name: 'AAPL', value: 30}, {name: 'GOOGL', value: 20} ],
             top_cards: { total_stocks: 0, avg_volume: 0, latest_close: 0 },
             risk_score: 4.2
          });
      }
  };

  const fetchDashboardSummary = async () => {
      try {
          const res = await fetch('/api/dashboard_summary');
          if (res.ok) setDashboardSummary(await res.json());
      } catch (e) {
          setDashboardSummary({
             status: 'ok',
             top_cards: {
               total_stocks: 42,
               top_gainer: { name: 'NVDA', change_pct: 4.2 },
               top_loser: { name: 'TSLA', change_pct: -1.8 },
               highest_volume: { name: 'AAPL', volume: '45M' }
             },
             indices: [
               { name: 'NIFTY 50', price: 19435.30, change: 1.24, data: [{label: '1', value: 19000}, {label: '2', value: 19435}] },
               { name: 'BTC/USD', price: 64281.90, change: -0.82, data: [{label: '1', value: 65000}, {label: '2', value: 64281}] }
             ]
          });
      }
  };

  const fetchStockSpecificData = async (stock: string) => {
      if (!stock) return;
      try {
          const res = await fetch(`/api/stock/${encodeURIComponent(stock)}`);
          if (res.ok) {
              setStockData(await res.json());
          } else {
              throw new Error("Failed to fetch stock data");
          }
      } catch (e) {
          console.error(e);
          // Fallback if API fails (e.g., Vercel timeout or YFinance blocked)
          setStockData({
              status: 'success',
              stock_name: stock,
              median_average: 150,
              dashboard_data: Array.from({length: 30}, (_, i) => ({
                  label: new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0],
                  value: 150 + Math.random() * 20 - 10,
                  open: 150,
                  high: 160,
                  low: 140,
                  close: 150,
                  is_anomaly: false,
                  upper_band: 170,
                  lower_band: 130
              })),
              prediction_data: Array.from({length: 10}, (_, i) => ({
                  time: i,
                  historical: i < 5 ? 150 + Math.random() * 10 : null,
                  predicted: i >= 5 ? 155 + Math.random() * 10 : null
              })),
              neural_data: { correlations: [], sector_predictions: [] },
              current_price: 155,
              strategies: {
                  intraday: { action: 'Buy', description: 'Fallback logic active.' },
                  short_term: { action: 'Hold', description: 'Fallback logic active.' },
                  long_term: { action: 'Hold', description: 'Fallback logic active.' }
              }
          });
      }
  };

  useEffect(() => {
     let isMounted = true;
     const init = async () => {
         setAppState('SCANNING');
         try {
             const stocksRes = await fetch('/api/stocks');
             const stocksData = await stocksRes.json();
             const stocks = stocksData.stocks || [{ticker: "AAPL", name: "Apple Inc."}];
             
             if (isMounted) {
                 setAvailableStocks(stocks);
                 const defaultStock = stocks[0].ticker;
                 setSelectedStock(defaultStock);
                 
                 await Promise.all([
                     fetchPortfolioData(),
                     fetchDashboardSummary(),
                     fetchStockSpecificData(defaultStock)
                 ]);
                 
                 setTimeout(() => {
                     if (isMounted) setAppState('ACTIVE');
                 }, 1500);
             }
         } catch (e) {
             console.error("AI Backend server is offline or unreachable.", e);
             // Fallback for visual testing
             setAvailableStocks([{ticker: "AAPL", name: "Apple Inc."}]);
             setSelectedStock('AAPL');
             fetchPortfolioData();
             fetchDashboardSummary();
             setAppState('ACTIVE');
         }
     };
     init();
     return () => { isMounted = false; };
  }, []);

  useEffect(() => {
      if (theme === 'system') {
          const isLight = window.matchMedia('(prefers-color-scheme: light)').matches;
          document.documentElement.setAttribute('data-theme', isLight ? 'light' : 'dark');
      } else {
          document.documentElement.setAttribute('data-theme', theme);
      }
  }, [theme]);

  const handleStockSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const stock = e.target.value;
      setSelectedStock(stock);
      fetchStockSpecificData(stock);
  };

  if (appState === 'SCANNING') {
      return (
          <div className="flex-1 h-screen flex flex-col items-center justify-center relative bg-surface overflow-hidden">
              {/* Atmospheric Background Elements */}
              <div className="absolute inset-0 z-0 pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-secondary/5 rounded-full blur-[120px]"></div>
                  <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]"></div>
              </div>
              
              {/* Central Scanner Visual */}
              <div className="relative z-10 flex flex-col items-center">
                  {/* Pulse Orb Component */}
                  <div className="relative mb-12">
                      <div className="absolute inset-0 rounded-full border border-secondary/20 scale-[1.5] opacity-20 animate-ping"></div>
                      <div className="absolute inset-0 rounded-full border border-secondary/10 scale-[2] opacity-10 animate-pulse"></div>
                      <div className="relative w-48 h-48 rounded-full bg-surface-container-low flex items-center justify-center shadow-[0_0_30px_rgba(0,227,253,0.3)] overflow-hidden group">
                          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
                          <div className="w-32 h-32 rounded-full bg-surface-container-highest flex items-center justify-center relative overflow-hidden border border-secondary/10">
                              <span className="material-symbols-outlined text-5xl text-secondary animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/20 to-transparent h-1/4 w-full top-0 animate-[spin_3s_linear_infinite]"></div>
                          </div>
                          <svg className="absolute inset-0 w-full h-full -rotate-90 animate-[spin_4s_linear_infinite]">
                              <circle className="text-secondary/10" cx="96" cy="96" fill="transparent" r="92" stroke="currentColor" strokeWidth="2"></circle>
                              <circle className="text-secondary" cx="96" cy="96" fill="transparent" r="92" stroke="currentColor" strokeDasharray="578" strokeDashoffset="180" strokeWidth="2"></circle>
                          </svg>
                      </div>
                  </div>
                  
                  {/* Loading Text & Status */}
                  <div className="text-center space-y-4">
                      <div className="flex flex-col items-center">
                          <h2 className="text-4xl font-headline font-bold text-on-surface tracking-tight mb-2">Identifying Multi-Factor Patterns...</h2>
                          <p className="text-on-surface-variant font-body text-sm max-w-md">Our neural oracle is currently synthesizing real-time sentiment data, historical volatility, and institutional flow signatures.</p>
                      </div>
                      <div className="w-80 h-1 bg-surface-container-highest rounded-full overflow-hidden mx-auto mt-8 relative">
                          <div className="absolute top-0 left-0 h-full w-2/3 bg-gradient-to-r from-primary to-secondary rounded-full animate-pulse"></div>
                      </div>
                      <div className="flex justify-between w-80 mx-auto">
                          <span className="text-[10px] font-label uppercase tracking-widest text-secondary font-bold">Scanning</span>
                          <span className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">68% Complete</span>
                      </div>
                  </div>
              </div>

              {/* Data Feed Sidebar (Asymmetric Layout) */}
              <div className="absolute right-12 top-1/2 -translate-y-1/2 w-72 space-y-4 z-10 hidden lg:block">
                  <h3 className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-6 flex items-center">
                      <span className="w-2 h-2 rounded-full bg-secondary mr-2 animate-pulse"></span>
                      Active Data Streams
                  </h3>
                  <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/10 shadow-lg shadow-black/20">
                      <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">Sentiment</p>
                      <div className="flex items-center justify-between mt-1">
                          <span className="text-sm font-medium text-on-surface">Retail Bias</span>
                          <span className="text-xs font-bold text-primary">HIGHLY BULLISH</span>
                      </div>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/10 shadow-lg shadow-black/20">
                      <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">Macro Factors</p>
                      <div className="flex items-center justify-between mt-1">
                          <span className="text-sm font-medium text-on-surface">Yield Delta</span>
                          <span className="text-xs font-bold text-error">+0.42% Vibe</span>
                      </div>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-container-high border border-secondary/20 shadow-lg shadow-[0_0_15px_rgba(0,227,253,0.1)]">
                      <p className="text-[10px] font-label uppercase tracking-widest text-secondary font-bold">New Signal</p>
                      <div className="flex items-center justify-between mt-1">
                          <span className="text-sm font-medium text-on-surface">Whale Liquidity</span>
                          <span className="text-xs font-bold text-secondary animate-pulse">INGESTING...</span>
                      </div>
                  </div>
              </div>

              {/* Decorative UI Elements */}
              <div className="absolute bottom-12 left-12 flex space-x-12 z-10">
                  <div>
                      <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-1">Compute Latency</p>
                      <p className="text-2xl font-headline font-bold text-on-surface">42<span className="text-sm text-secondary ml-1">ms</span></p>
                  </div>
                  <div>
                      <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-1">Nodes Active</p>
                      <p className="text-2xl font-headline font-bold text-on-surface">1,024</p>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <>
      <aside className="h-screen w-64 fixed left-0 top-0 bg-[#090e19] flex flex-col py-8 shadow-[0px_0px_15px_rgba(0,215,240,0.12)] z-50">
        <div className="px-6 mb-12">
          <h1 className="text-2xl font-bold tracking-tight text-[#00e3fd] font-headline">Aura.AI</h1>
          <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mt-1 overflow-hidden text-ellipsis whitespace-nowrap">Welcome, {userName}</p>
        </div>
        <nav className="flex-1 space-y-1">
          <Link id="tour-nav-dashboard" to="/dashboard" className={`flex items-center px-6 py-4 transition-all duration-300 ${path.includes('/dashboard') ? 'text-[#00e3fd] border-r-2 border-[#00e3fd] bg-[#191f2e]' : 'text-[#a6abba] hover:bg-[#1f2636] hover:text-[#89acff]'}`}>
            <span className="material-symbols-outlined mr-4">dashboard</span>
            <span className="font-body text-sm font-medium">Command Center</span>
          </Link>
          <Link id="tour-nav-analysis" to="/analysis" className={`flex items-center px-6 py-4 transition-all duration-300 ${path.includes('/analysis') ? 'text-[#00e3fd] border-r-2 border-[#00e3fd] bg-[#191f2e]' : 'text-[#a6abba] hover:bg-[#1f2636] hover:text-[#89acff]'}`}>
            <span className="material-symbols-outlined mr-4">query_stats</span>
            <span className="font-body text-sm font-medium">Market Pulse</span>
          </Link>
          <Link id="tour-nav-ai-scanner" to="/ai-scanner" className={`flex items-center px-6 py-4 transition-all duration-300 ${path.includes('/ai-scanner') ? 'text-[#00e3fd] border-r-2 border-[#00e3fd] bg-[#191f2e]' : 'text-[#a6abba] hover:bg-[#1f2636] hover:text-[#89acff]'}`}>
            <span className="material-symbols-outlined mr-4">auto_awesome</span>
            <span className="font-body text-sm font-medium">AI Scanner</span>
          </Link>
          <Link id="tour-nav-neural" to="/neural-intelligence" className={`flex items-center px-6 py-4 transition-all duration-300 ${path.includes('/neural-intelligence') ? 'text-[#00e3fd] border-r-2 border-[#00e3fd] bg-[#191f2e]' : 'text-[#a6abba] hover:bg-[#1f2636] hover:text-[#89acff]'}`}>
            <span className="material-symbols-outlined mr-4">psychology</span>
            <span className="font-body text-sm font-medium">Neural Intelligence</span>
          </Link>
          <Link id="tour-nav-aura-assistant" to="/aura-assistant" className={`flex items-center px-6 py-4 transition-all duration-300 ${path.includes('/aura-assistant') ? 'text-[#00e3fd] border-r-2 border-[#00e3fd] bg-[#191f2e]' : 'text-[#a6abba] hover:bg-[#1f2636] hover:text-[#89acff]'}`}>
            <span className="material-symbols-outlined mr-4">support_agent</span>
            <span className="font-body text-sm font-medium">Aura Assistant</span>
          </Link>
          <Link id="tour-nav-portfolio" to="/portfolio" className={`flex items-center px-6 py-4 transition-all duration-300 ${path.includes('/portfolio') ? 'text-[#00e3fd] border-r-2 border-[#00e3fd] bg-[#191f2e]' : 'text-[#a6abba] hover:bg-[#1f2636] hover:text-[#89acff]'}`}>
            <span className="material-symbols-outlined mr-4">account_balance_wallet</span>
            <span className="font-body text-sm font-medium">Portfolio</span>
          </Link>
          <div id="tour-aura-voice" className="px-6 py-2">
            <VoiceAssistant 
                selectedStock={selectedStock} 
                voiceFeedback={voiceFeedback}
                voiceType={voiceType}
                userName={userName}
                onAction={(action: string, payload: string) => {
                    if (action === 'CHANGE_STOCK') {
                        let finalStock = payload.toUpperCase();
                        const matched = availableStocks.find(s => 
                            s.ticker.toUpperCase() === finalStock || 
                            s.name.toUpperCase().includes(finalStock) ||
                            finalStock.includes(s.ticker.toUpperCase()) ||
                            finalStock.includes(s.name.split(' ')[0].toUpperCase())
                        );
                        if (matched) {
                            finalStock = matched.ticker;
                        }
                        setSelectedStock(finalStock);
                        fetchStockSpecificData(finalStock);
                    }
                    if (action === 'CHANGE_CURRENCY') setCurrency(payload);
                    if (action === 'NAVIGATE') navigate(payload);
                    if (action === 'DELETE_ACCOUNT') {
                       localStorage.clear();
                       localStorage.setItem('theme', 'dark');
                       setTheme('dark');
                       navigate('/login');
                    }
                    if (action === 'LOGOUT') {
                       localStorage.removeItem('isLoggedIn');
                       localStorage.setItem('theme', 'dark');
                       setTheme('dark');
                       navigate('/login');
                    }
                }}
            />
          </div>
          <Link id="tour-nav-settings" to="/settings" className={`flex items-center px-6 py-4 transition-all duration-300 ${path.includes('/settings') ? 'text-[#00e3fd] border-r-2 border-[#00e3fd] bg-[#191f2e]' : 'text-[#a6abba] hover:bg-[#1f2636] hover:text-[#89acff]'}`}>
            <span className="material-symbols-outlined mr-4">settings</span>
            <span className="font-body text-sm font-medium">Settings</span>
          </Link>
        </nav>
        <div className="px-6 mt-auto">
          <button 
            id="tour-quick-trade"
            onClick={() => triggerTrade(selectedStock)}
            className="w-full py-3 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold rounded-full text-sm shadow-[0px_0px_15px_rgba(137,172,255,0.3)] hover:scale-95 transition-all duration-150 uppercase tracking-widest">
            Quick Trade
          </button>
        </div>
      </aside>

      <header className="fixed top-0 right-0 w-[calc(100%-16rem)] z-40 bg-[#090e19]/80 backdrop-blur-xl flex items-center justify-between px-8 h-20 border-b border-outline-variant/10">
        <div className="flex items-center flex-1 max-w-xl">
          <div id="tour-search" className="relative w-full group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
            <input 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowSearchResults(true); }}
              onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
              className="bg-surface-container-highest border-none rounded-full py-2.5 pl-12 pr-4 text-xs font-label tracking-widest focus:ring-1 focus:ring-secondary/30 w-full transition-all text-on-surface outline-none placeholder:text-on-surface-variant/50" 
              placeholder="SCAN MARKETS OR ASSETS..." type="text"/>
            
            {showSearchResults && searchQuery && (
              <div className="absolute top-full mt-2 w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto">
                 {filteredStocks.map(stock => (
                   <div 
                     key={stock.ticker} 
                     onMouseDown={() => { setSelectedStock(stock.ticker); fetchStockSpecificData(stock.ticker); setSearchQuery(''); setShowSearchResults(false); }}
                     className="px-4 py-3 hover:bg-secondary/10 cursor-pointer flex justify-between items-center text-xs text-on-surface"
                   >
                     <span className="font-bold">{stock.ticker}</span>
                     <span className="text-on-surface-variant">{stock.name}</span>
                   </div>
                 ))}
                 {filteredStocks.length === 0 && <div className="p-4 text-xs text-on-surface-variant text-center">No assets found</div>}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div id="tour-stock-selector" className="relative">
              <select 
                  value={selectedStock} 
                  onChange={handleStockSelection}
                  className="appearance-none bg-surface-container-highest border border-outline-variant/20 rounded-lg px-4 py-2 pr-10 text-xs font-bold text-on-surface focus:outline-none focus:border-secondary cursor-pointer w-48 truncate"
              >
                  {availableStocks.map(stock => (
                      <option key={stock.ticker} value={stock.ticker}>{stock.name}</option>
                  ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[16px] text-on-surface-variant pointer-events-none">expand_more</span>
          </div>
          
          <div id="tour-currency-changer" className="relative">
              <select 
                  value={currency} 
                  onChange={(e) => setCurrency(e.target.value)}
                  className="appearance-none bg-surface-container-highest border border-outline-variant/20 rounded-lg px-4 py-2 pr-10 text-xs font-bold text-on-surface focus:outline-none focus:border-secondary cursor-pointer w-24 truncate uppercase"
              >
                  {['USD', 'INR', 'EURO', 'POUND', 'Australian Dollar', 'Hong Kong Dollar'].map(c => (
                      <option key={c} value={c}>{c.replace(' Dollar', '').replace('Hong Kong', 'HKD').replace('Australian', 'AUD')}</option>
                  ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[16px] text-on-surface-variant pointer-events-none">expand_more</span>
          </div>
          
          <button className="text-[#a6abba] hover:text-[#00e3fd] transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          
          <div className="w-[1px] h-8 bg-outline-variant/30"></div>
          
          <div className="relative">
            <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setShowProfileMenu(!showProfileMenu)}>
              <div className="text-right">
                <p className="text-xs font-bold text-on-surface group-hover:text-secondary transition-colors">{userName}</p>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">User</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-surface-container-highest flex items-center justify-center overflow-hidden border border-secondary/20 group-hover:border-secondary transition-colors">
                <img alt="Aura User" className="h-full w-full object-cover" src={profilePicUrl}/>
              </div>
            </div>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-surface-container-highest border border-outline-variant/20 rounded-xl shadow-2xl overflow-hidden z-50">
                <div 
                  className="px-4 py-3 hover:bg-secondary/10 cursor-pointer flex items-center text-xs text-on-surface transition-colors"
                  onClick={() => { setShowProfileMenu(false); navigate('/settings'); }}
                >
                  <span className="material-symbols-outlined mr-2 text-[18px]">settings</span>
                  <span className="font-bold">Settings</span>
                </div>
                <div 
                  className="px-4 py-3 hover:bg-error/10 cursor-pointer flex items-center text-xs text-error transition-colors border-t border-outline-variant/10"
                  onClick={() => { setShowProfileMenu(false); setShowLogoutWarning(true); }}
                >
                  <span className="material-symbols-outlined mr-2 text-[18px]">logout</span>
                  <span className="font-bold">Logout</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="ml-64 pt-28 p-8 min-h-screen pb-12 relative overflow-x-hidden">
        {showLogoutWarning && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center">
             <div className="bg-surface-container border border-outline-variant/20 rounded-2xl p-8 max-w-md w-full shadow-2xl">
                <div className="flex items-center mb-4 text-error">
                   <span className="material-symbols-outlined text-3xl mr-3">warning</span>
                   <h3 className="text-xl font-headline font-bold">Confirm Logout</h3>
                </div>
                <p className="text-sm text-on-surface-variant mb-8">Are you sure you want to log out of your Aura.AI account?</p>
                <div className="flex gap-4">
                   <button 
                     onClick={() => setShowLogoutWarning(false)}
                     className="flex-1 py-3 bg-surface-container-highest border border-outline-variant/20 text-on-surface rounded-lg font-bold text-sm hover:bg-surface-container-high transition-colors"
                   >
                     No, Keep it
                   </button>
                   <button 
                     onClick={() => {
                       localStorage.removeItem('isLoggedIn');
                       localStorage.setItem('theme', 'dark');
                       setTheme('dark');
                       setShowLogoutWarning(false);
                       navigate('/login');
                     }}
                     className="flex-1 py-3 bg-error text-white rounded-lg font-bold text-sm shadow-[0_0_15px_rgba(255,0,0,0.3)] hover:scale-[1.02] transition-transform"
                   >
                     Yes, Logout
                   </button>
                </div>
             </div>
          </div>
        )}

        {tradeMessage && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-surface-container-highest border border-secondary/30 shadow-2xl px-6 py-3 rounded-full flex items-center gap-3 z-[200]">
             <span className="material-symbols-outlined text-secondary">check_circle</span>
             <span className="text-sm font-bold text-on-surface">{tradeMessage}</span>
          </div>
        )}

        <Outlet context={{ 
          stockData, portfolioData, dashboardSummary, availableStocks, selectedStock, setSelectedStock, fetchStockSpecificData, currency, setCurrency, formatPrice, triggerTrade, userName, setUserName, email, setEmail, profilePicUrl, setProfilePicUrl,
          theme, setTheme, chartColors, setChartColors, voiceFeedback, setVoiceFeedback, voiceType, setVoiceType, defaultMarket, setDefaultMarket, defaultIndicators, setDefaultIndicators, refreshRate, setRefreshRate, aiModel, setAiModel
        }} />
        
        <Walkthrough />
      </main>
    </>
  );
}
