import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import heroImage from '../assets/picture.jpeg';

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const [typedText1, setTypedText1] = useState('');
  const [typedText2, setTypedText2] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleNavigation = (path: string) => {
    setIsLoading(true);
    setTimeout(() => {
        setIsLoading(false);
        if (localStorage.getItem('isLoggedIn') === 'true') {
            navigate(path);
        } else {
            navigate('/login');
        }
    }, 1500);
  };

  useEffect(() => {
    const str1 = "Welcome to the Future of ";
    const str2 = "Market Intelligence";
    let i = 0;
    const interval = setInterval(() => {
      if (i < str1.length) {
        setTypedText1(str1.slice(0, i + 1));
      } else if (i < str1.length + str2.length) {
        setTypedText2(str2.slice(0, i - str1.length + 1));
      } else {
        clearInterval(interval);
      }
      i++;
    }, 50); // Sped up slightly for smoother typing feel
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-surface text-on-surface selection:bg-secondary/30 min-h-screen relative overflow-x-hidden">
      <style>{`
        .font-headline { font-family: 'Space Grotesk', sans-serif; }
        .glass-nav {
          background: rgba(9, 14, 25, 0.8);
          backdrop-filter: blur(20px);
        }
        .aura-glow {
          box-shadow: 0px 0px 25px rgba(0, 227, 253, 0.15);
        }
        .data-pattern {
          background-image: radial-gradient(#1f2636 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>
      
{/* TopNavBar (Shared Component Integration) */}
<nav className="fixed top-0 right-0 w-full z-50 glass-nav flex items-center justify-between px-8 h-20">
<div className="flex items-center gap-12">
<div className="text-xl font-black text-secondary tracking-tight font-headline">Aura.AI</div>
<div className="hidden md:flex gap-8">
<button onClick={() => handleNavigation('/dashboard')} className="text-[10px] uppercase tracking-widest font-label font-bold text-on-surface-variant hover:text-secondary transition-colors">Command Center</button>
<button onClick={() => handleNavigation('/dashboard')} className="text-[10px] uppercase tracking-widest font-label font-bold text-on-surface-variant hover:text-secondary transition-colors">Market Pulse</button>
<button onClick={() => handleNavigation('/ai-scanner')} className="text-[10px] uppercase tracking-widest font-label font-bold text-on-surface-variant hover:text-secondary transition-colors">AI Scanner</button>
</div>
</div>
<div className="flex items-center gap-6">
<div className="flex items-center gap-4 text-on-surface-variant">
<span className="material-symbols-outlined hover:text-secondary cursor-pointer transition-colors" onClick={() => alert('No new notifications')}>notifications</span>
<span className="material-symbols-outlined hover:text-secondary cursor-pointer transition-colors" onClick={() => alert('Help center is currently undergoing maintenance')}>help_outline</span>
<div className="h-8 w-8 rounded-full bg-surface-container-high border border-outline-variant/20 flex items-center justify-center overflow-hidden">
<img alt="Aura User" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100"/>
</div>
</div>
</div>
</nav>

{isLoading && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#090e19]/90 backdrop-blur-sm">
      <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin mb-4"></div>
          <p className="text-secondary font-label uppercase tracking-widest text-xs animate-pulse">Initializing Oracle...</p>
      </div>
  </div>
)}

<main className="relative">
{/* Hero Section */}
<section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
{/* Background Elements */}
<div className="absolute inset-0 data-pattern opacity-30"></div>
<div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px]"></div>
<div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/10 rounded-full blur-[120px]"></div>
<div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center">
<motion.div 
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, ease: "easeOut" }}
  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant/10 mb-8"
>
<span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
<span className="text-[10px] font-label font-extrabold tracking-[0.2em] uppercase text-secondary">System Online: v4.2.0 Oracle Core</span>
</motion.div>
<motion.h1 
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
  className="font-headline text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-on-surface max-w-5xl leading-[0.95] mb-8 min-h-[2em] md:min-h-[1.5em]"
>
                    {typedText1} <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary via-secondary to-primary-container">{typedText2}</span>
                    <span className="inline-block w-[4px] h-[0.8em] bg-secondary animate-pulse align-middle ml-1"></span>
</motion.h1>
<motion.p 
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
  className="font-body text-lg md:text-xl text-on-surface-variant max-w-2xl mb-12 leading-relaxed"
>
                    Harness the synthesized power of proprietary neural networks to predict volatility, discover hidden alpha, and execute trades with absolute precision.
                </motion.p>
<motion.div 
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
  className="flex flex-col sm:flex-row gap-4 items-center"
>
<button onClick={() => navigate('/login')} className="px-10 py-5 rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold tracking-tight hover:shadow-[0_0_20px_rgba(137,172,255,0.4)] transition-all active:scale-95 text-lg">
                        Get Started
                    </button>
</motion.div>
{/* Hero Image / Visual Asset */}
<div className="mt-20 w-full max-w-6xl relative">
<div className="absolute -inset-4 bg-secondary/5 blur-3xl rounded-full"></div>
<div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-4 aura-glow overflow-hidden">
<div className="bg-surface-container rounded-xl overflow-hidden aspect-video relative">
<img alt="Aura Intelligence Dashboard" className="w-full h-full object-cover opacity-100" src={heroImage}/>
<div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent"></div>
{/* Floating Metric Cards (Asymmetric Layout) */}
</div>
</div>
</div>
</div>
</section>
{/* Features Bento Grid */}
<section className="py-32 container mx-auto px-6">
<div className="grid grid-cols-1 md:grid-cols-12 gap-6">
{/* Large Feature */}
<div className="md:col-span-8 bg-surface-container-low rounded-3xl p-10 relative overflow-hidden group">
<div className="relative z-10">
<div className="material-symbols-outlined text-secondary text-4xl mb-6" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</div>
<h3 className="font-headline text-3xl font-bold mb-4">Neural Sentiment Analysis</h3>
<p className="text-on-surface-variant max-w-md mb-8">Scan over 100,000 global news sources and social signals in milliseconds to detect market sentiment shifts before they hit the ticker.</p>
<div className="flex items-center gap-4">
<div className="h-12 w-12 rounded-full bg-surface-container-high flex items-center justify-center border border-outline-variant/20">
<span className="material-symbols-outlined text-primary">psychology</span>
</div>
<div className="h-12 w-12 rounded-full bg-surface-container-high flex items-center justify-center border border-outline-variant/20">
<span className="material-symbols-outlined text-primary">hub</span>
</div>
<div className="h-12 w-12 rounded-full bg-surface-container-high flex items-center justify-center border border-outline-variant/20">
<span className="material-symbols-outlined text-primary">model_training</span>
</div>
</div>
</div>
<div className="absolute right-0 bottom-0 w-1/2 h-full opacity-20 group-hover:opacity-40 transition-opacity">
<img alt="Neural Grid" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1000"/>
</div>
</div>
{/* Small Feature 1 */}
<div className="md:col-span-4 bg-surface-container-high rounded-3xl p-10 flex flex-col justify-between border border-outline-variant/5">
<div>
<div className="material-symbols-outlined text-primary text-4xl mb-6">query_stats</div>
<h3 className="font-headline text-2xl font-bold mb-2">Predictive Pulse</h3>
<p className="text-sm text-on-surface-variant">Real-time volatility forecasting with 92% historical accuracy across major indices.</p>
</div>
<div className="mt-8 pt-8 border-t border-outline-variant/10">
<a href="https://example.com/predictive-pulse" target="_blank" rel="noopener noreferrer" className="text-xs font-label uppercase tracking-widest text-secondary font-bold hover:underline">Learn More →</a>
</div>
</div>
{/* Small Feature 2 */}
<div className="md:col-span-4 bg-surface-container rounded-3xl p-10 border border-outline-variant/5 flex flex-col justify-between">
<div>
<div className="material-symbols-outlined text-secondary text-4xl mb-6">account_balance_wallet</div>
<h3 className="font-headline text-2xl font-bold mb-2">Smart Portfolio</h3>
<p className="text-sm text-on-surface-variant">Automated rebalancing triggered by AI-detected risk thresholds and opportunity spikes.</p>
</div>
<div className="mt-8 h-20 w-full overflow-hidden">
<div className="flex items-end gap-1 h-full">
<div className="bg-primary/20 w-full h-1/2 rounded-t-sm"></div>
<div className="bg-primary/40 w-full h-2/3 rounded-t-sm"></div>
<div className="bg-primary/60 w-full h-1/3 rounded-t-sm"></div>
<div className="bg-primary w-full h-3/4 rounded-t-sm"></div>
<div className="bg-secondary w-full h-full rounded-t-sm shadow-[0_0_10px_rgba(0,227,253,0.3)]"></div>
</div>
</div>
</div>
{/* Medium Feature */}
<div className="md:col-span-8 bg-surface-container-highest/30 backdrop-blur-md rounded-3xl p-10 border border-secondary/10 relative overflow-hidden">
<div className="flex flex-col md:flex-row gap-12 items-center">
<div className="flex-1">
<h3 className="font-headline text-3xl font-bold mb-4">Command Center Mobile</h3>
<p className="text-on-surface-variant mb-6">Monitor the oracle from anywhere. Full suite of analysis tools optimized for the palm of your hand.</p>
<button className="px-6 py-3 rounded-full bg-on-surface text-surface font-bold tracking-tight hover:bg-secondary transition-colors">Download App</button>
</div>
<div className="w-48 h-80 bg-surface-container-lowest rounded-[2rem] border-4 border-outline-variant/30 overflow-hidden relative aura-glow">
<img alt="Mobile Interface" className="w-full h-full object-cover" src="/mobile-app.png"/>
</div>
</div>
</div>
</div>
</section>
{/* Dynamic Data Section */}
<section className="py-24 bg-surface-container-lowest relative">
<div className="container mx-auto px-6">
<div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
<div className="max-w-xl">
<h2 className="font-headline text-4xl font-bold mb-4 italic">Live Scanner Feed</h2>
<p className="text-on-surface-variant">The synthesized oracle is currently scanning 2,409 assets. Here are the latest high-conviction signals.</p>
</div>
<div className="flex gap-4">
<span className="px-4 py-2 bg-surface-container-high rounded-full text-[10px] font-label font-bold text-secondary uppercase tracking-widest border border-secondary/20">All Markets</span>
</div>
</div>
<div className="space-y-4">
{/* Data Row 1 */}
<div className="group bg-surface-container-low hover:bg-surface-container-high p-6 rounded-2xl flex flex-wrap md:flex-nowrap items-center gap-8 transition-all border border-transparent hover:border-secondary/20">
<div className="flex items-center gap-4 min-w-[200px]">
<div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">B</div>
<div>
<div className="font-headline font-bold text-lg">BTC / USD</div>
<div className="text-[10px] font-label text-on-surface-variant uppercase">Bitcoin Core</div>
</div>
</div>
<div className="flex-1">
<div className="h-8 w-full">
<svg className="w-full h-full preserve-3d" viewBox="0 0 400 40" preserveAspectRatio="none">
<path className="drop-shadow-[0_0_5px_rgba(0,227,253,0.5)]" d="M0,20 Q50,5 100,30 T200,10 T300,25 T400,5" fill="none" stroke="#00e3fd" strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
</svg>
</div>
</div>
<div className="text-right min-w-[120px]">
<div className="font-headline font-bold text-xl">$64,281.90</div>
<div className="text-[10px] font-label text-secondary font-bold uppercase">+4.2% (24H)</div>
</div>
<div className="min-w-[150px]">
<div className="px-4 py-2 rounded-lg bg-secondary/10 border border-secondary/30 text-center">
<span className="text-[10px] font-label font-bold text-secondary uppercase tracking-widest">High Conviction Buy</span>
</div>
</div>
</div>
{/* Data Row 2 */}
<div className="group bg-surface-container-low hover:bg-surface-container-high p-6 rounded-2xl flex flex-wrap md:flex-nowrap items-center gap-8 transition-all border border-transparent hover:border-secondary/20">
<div className="flex items-center gap-4 min-w-[200px]">
<div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary-container font-bold">N</div>
<div>
<div className="font-headline font-bold text-lg">NVDA / NASDAQ</div>
<div className="text-[10px] font-label text-on-surface-variant uppercase">NVIDIA Corp</div>
</div>
</div>
<div className="flex-1">
<div className="h-8 w-full">
<svg className="w-full h-full preserve-3d" viewBox="0 0 400 40" preserveAspectRatio="none">
<path className="drop-shadow-[0_0_5px_rgba(137,172,255,0.5)]" d="M0,35 Q50,30 100,38 T200,20 T300,10 T400,2" fill="none" stroke="#89acff" strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
</svg>
</div>
</div>
<div className="text-right min-w-[120px]">
<div className="font-headline font-bold text-xl">$894.22</div>
<div className="text-[10px] font-label text-primary font-bold uppercase">+1.8% (24H)</div>
</div>
<div className="min-w-[150px]">
<div className="px-4 py-2 rounded-lg bg-surface-container-highest border border-outline-variant/30 text-center">
<span className="text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-widest">Neutral Hold</span>
</div>
</div>
</div>
</div>
</div>
</section>
{/* Final CTA Section */}
<section className="py-32 relative overflow-hidden">
<div className="absolute inset-0 bg-gradient-to-b from-surface via-surface-container-low to-surface"></div>
<div className="container mx-auto px-6 relative z-10">
<div className="bg-surface-container rounded-[3rem] p-12 md:p-24 border border-outline-variant/10 text-center aura-glow relative overflow-hidden">
<div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
<h2 className="font-headline text-4xl md:text-6xl font-bold mb-8 leading-tight">Ready to transcend the <br/>standard market?</h2>
<p className="text-on-surface-variant text-lg md:text-xl max-w-2xl mx-auto mb-12">
                        Join 50,000+ elite traders who have automated their alpha with Aura.AI. Start your 14-day full access trial today.
                    </p>
<div className="flex flex-col sm:flex-row justify-center gap-6">
<button onClick={() => navigate('/login')} className="px-12 py-5 rounded-full bg-secondary text-surface font-black tracking-tight hover:scale-105 transition-transform text-lg">
                            Get Started Now
                        </button>
</div>
</div>
</div>
</section>
</main>
{/* Footer */}
<footer className="bg-surface-container-lowest py-20 px-6 border-t border-outline-variant/5">
<div className="container mx-auto">
<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 mb-20">
<div className="col-span-2">
<div className="text-2xl font-black text-secondary font-headline mb-6 tracking-tight">Aura.AI</div>
<p className="text-on-surface-variant text-sm max-w-xs leading-relaxed">
                        The synthesized oracle for the next generation of financial intelligence. Powered by advanced neural architectures.
                    </p>
</div>
<div>
<h4 className="font-headline font-bold text-on-surface mb-6 uppercase tracking-widest text-xs">Intelligence</h4>
<ul className="space-y-4 text-sm text-on-surface-variant">
<li><a className="hover:text-secondary transition-colors" href="#">Market Pulse</a></li>
<li><a className="hover:text-secondary transition-colors" href="#">AI Scanner</a></li>
<li><a className="hover:text-secondary transition-colors" href="#">Neural Sentiment</a></li>
</ul>
</div>
<div>
<h4 className="font-headline font-bold text-on-surface mb-6 uppercase tracking-widest text-xs">Resources</h4>
<ul className="space-y-4 text-sm text-on-surface-variant">
<li><a className="hover:text-secondary transition-colors" href="#">API Docs</a></li>
<li><a className="hover:text-secondary transition-colors" href="#">Whitepaper</a></li>
<li><a className="hover:text-secondary transition-colors" href="#">System Status</a></li>
</ul>
</div>
<div>
<h4 className="font-headline font-bold text-on-surface mb-6 uppercase tracking-widest text-xs">Company</h4>
<ul className="space-y-4 text-sm text-on-surface-variant">
<li><a className="hover:text-secondary transition-colors" href="#">About Us</a></li>
<li><a className="hover:text-secondary transition-colors" href="#">Careers</a></li>
<li><a className="hover:text-secondary transition-colors" href="#">Security</a></li>
</ul>
</div>
<div>
<h4 className="font-headline font-bold text-on-surface mb-6 uppercase tracking-widest text-xs">Connect</h4>
<ul className="space-y-4 text-sm text-on-surface-variant">
<li><a className="hover:text-secondary transition-colors" href="#">Terminal</a></li>
<li><a className="hover:text-secondary transition-colors" href="#">Twitter / X</a></li>
<li><a className="hover:text-secondary transition-colors" href="#">Discord</a></li>
</ul>
</div>
</div>
<div className="pt-8 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-4">
<div className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">
                    © 2024 Aura Intelligence Systems. All analytical rights reserved.
                </div>
<div className="flex gap-8 text-[10px] font-label uppercase tracking-widest text-on-surface-variant">
<a className="hover:text-secondary" href="#">Privacy Protocol</a>
<a className="hover:text-secondary" href="#">Terms of Service</a>
</div>
</div>
</div>
</footer>

    </div>
  );
};

export default Welcome;
