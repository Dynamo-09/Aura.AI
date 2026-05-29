import React, { useState, useEffect, useRef, useCallback } from 'react';

interface TourStep {
  targetId: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const steps: TourStep[] = [
  {
    targetId: 'tour-nav-dashboard',
    title: 'Command Center',
    content: 'Your central hub for market insights, portfolio overview, and live data.',
    position: 'right',
  },
  {
    targetId: 'tour-nav-analysis',
    title: 'Market Pulse',
    content: 'Deep dive into market trends, technical indicators, and comprehensive stock analysis.',
    position: 'right',
  },
  {
    targetId: 'tour-nav-ai-scanner',
    title: 'AI Scanner',
    content: 'Leverage artificial intelligence to discover hidden market opportunities and anomalies.',
    position: 'right',
  },
  {
    targetId: 'tour-nav-neural',
    title: 'Neural Intelligence',
    content: 'Scan global news sources and social signals to detect market sentiment shifts.',
    position: 'right',
  },
  {
    targetId: 'tour-nav-aura-assistant',
    title: 'Aura Assistant',
    content: 'Your dedicated AI support agent for portfolio queries and real-time market assistance.',
    position: 'right',
  },
  {
    targetId: 'tour-aura-voice',
    title: 'Voice Oracle',
    content: 'Enable voice feedback or give direct verbal commands to your synthesized oracle.',
    position: 'right',
  },
  {
    targetId: 'tour-nav-portfolio',
    title: 'Portfolio',
    content: 'Track your investments, analyze performance, and manage your assets in real-time.',
    position: 'right',
  },
  {
    targetId: 'tour-nav-settings',
    title: 'Settings',
    content: 'Configure your personalized AI themes, preferences, and platform behaviors.',
    position: 'right',
  },
  {
    targetId: 'tour-search',
    title: 'Global Asset Search',
    content: 'Instantly find any stock, crypto, or forex pair to load its data across the entire command center.',
    position: 'bottom',
  },
  {
    targetId: 'tour-stock-selector',
    title: 'Active Asset Selection',
    content: 'Switch between your tracked assets quickly to view their specific market data.',
    position: 'bottom',
  },
  {
    targetId: 'tour-currency-changer',
    title: 'Base Currency',
    content: 'Instantly convert all portfolio and asset data into your preferred local currency.',
    position: 'bottom',
  },
  {
    targetId: 'tour-quick-trade',
    title: 'Lightning Execution',
    content: 'Execute trades instantly based on AI signals directly from the sidebar without leaving your view.',
    position: 'right',
  }
];

export default function Walkthrough() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [boxRect, setBoxRect] = useState<DOMRect | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hasSeen = localStorage.getItem('hasSeenWalkthrough');
    if (!hasSeen) {
      setTimeout(() => {
        setIsVisible(true);
        setTimeout(() => setIsTransitioning(false), 300);
      }, 1500);
    }
  }, []);

  const updateRects = useCallback(() => {
    if (!isVisible) return;
    const step = steps[currentStep];
    const el = document.getElementById(step.targetId);
    if (el) {
      setTargetRect(el.getBoundingClientRect());
    }
    if (boxRef.current) {
      setBoxRect(boxRef.current.getBoundingClientRect());
    }
  }, [isVisible, currentStep]);

  useEffect(() => {
    if (!isVisible) return;
    setTimeout(updateRects, 0);
    window.addEventListener('resize', updateRects);
    // Poll just in case the layout shifts
    const interval = setInterval(updateRects, 500);
    return () => {
      window.removeEventListener('resize', updateRects);
      clearInterval(interval);
    };
  }, [isVisible, updateRects]);

  if (!isVisible || !targetRect) return null;

  const step = steps[currentStep];
  
  // Calculate Tooltip Box Position
  const boxStyle: React.CSSProperties = { position: 'fixed', zIndex: 10000 };
  const gap = 80; // Distance from target

  if (step.position === 'bottom') {
    boxStyle.top = targetRect.bottom + gap;
    boxStyle.left = targetRect.left + (targetRect.width / 2) - 150; // Center relative to target (assuming width 300)
  } else if (step.position === 'right') {
    boxStyle.top = targetRect.top + (targetRect.height / 2) - 100; // Center relative to target
    boxStyle.left = targetRect.right + gap;
  } else if (step.position === 'left') {
    boxStyle.top = targetRect.top + (targetRect.height / 2) - 100;
    boxStyle.left = targetRect.left - gap - 300; // 300 is box width
  }

  // Prevent box from overflowing screen
  if (boxStyle.left && (boxStyle.left as number) < 20) boxStyle.left = 20;
  if (boxStyle.left && (boxStyle.left as number) > window.innerWidth - 320) boxStyle.left = window.innerWidth - 320;
  if (boxStyle.top && (boxStyle.top as number) < 20) boxStyle.top = 20;
  if (boxStyle.top && (boxStyle.top as number) > window.innerHeight - 220) boxStyle.top = window.innerHeight - 220;

  // Calculate SVG Path for the curved tail
  let pathD = '';
  if (boxRect && targetRect) {
    let startX = boxRect.left + boxRect.width / 2;
    let startY = boxRect.top + boxRect.height / 2;
    
    // Target anchor points
    let endX = targetRect.left + targetRect.width / 2;
    let endY = targetRect.top + targetRect.height / 2;
    
    let cp2X = endX;
    let cp2Y = endY;

    if (step.position === 'bottom') {
      startY = boxRect.top; // leave from top edge
      endY = targetRect.bottom + 10;
      cp2X = endX;
      cp2Y = endY + 60; // Approach straight up from below
    } else if (step.position === 'right') {
      startX = boxRect.left; // leave from left edge
      endX = targetRect.right + 10;
      cp2X = endX + 60; // Approach straight left from right
      cp2Y = endY;
    } else if (step.position === 'left') {
      startX = boxRect.right; // leave from right edge
      endX = targetRect.left - 10;
      cp2X = endX - 60; // Approach straight right from left
      cp2Y = endY;
    }

    // Control point 1 leaving the box smoothly
    let cp1X = startX;
    let cp1Y = startY;
    if (step.position === 'bottom') {
      cp1Y = startY - 60; 
    } else if (step.position === 'right') {
      cp1X = startX - 60; 
    } else if (step.position === 'left') {
      cp1X = startX + 60; 
    }

    pathD = `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;
  }

  const handleNext = () => {
    if (isTransitioning) return;
    if (currentStep < steps.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 500); // Wait for highlight box to move
      }, 300); // Time to fade out
    } else {
      closeTour();
    }
  };

  const closeTour = () => {
    setIsVisible(false);
    localStorage.setItem('hasSeenWalkthrough', 'true');
  };

  return (
    <>
      <div className="fixed inset-0 z-[9998] bg-[#090e19]/60 backdrop-blur-[2px] transition-all"></div>
      
      {/* Target Highlight Overlay */}
      <div 
        className="fixed z-[9999] rounded-xl border-2 border-[#00e3fd] shadow-[0_0_20px_#00e3fd] transition-all duration-500 ease-in-out pointer-events-none"
        style={{
          top: targetRect.top - 8,
          left: targetRect.left - 8,
          width: targetRect.width + 16,
          height: targetRect.height + 16,
        }}
      ></div>

      {/* SVG Animated Tail */}
      <svg className={`fixed inset-0 w-full h-full z-[10000] pointer-events-none transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#00e3fd" />
          </marker>
        </defs>
        <path
          className="walkthrough-tail"
          d={pathD}
          fill="none"
          stroke="#00e3fd"
          strokeWidth="3"
          strokeDasharray="10 5"
          markerEnd="url(#arrowhead)"
          style={{ filter: 'drop-shadow(0 0 5px #00e3fd)' }}
        />
      </svg>

      {/* Walkthrough Box */}
      <div 
        ref={boxRef}
        className={`bg-surface-container-high border border-[#00e3fd]/30 rounded-2xl p-6 shadow-2xl shadow-black w-[300px] flex flex-col gap-4 duration-300 transition-all ${isTransitioning ? 'opacity-0 translate-y-4 scale-95 pointer-events-none' : 'opacity-100 translate-y-0 scale-100'}`}
        style={boxStyle}
      >
        <div className="flex justify-between items-start">
          <h3 className="text-[#00e3fd] font-headline font-bold text-lg">{step.title}</h3>
          <span className="text-[#a6abba] text-xs font-label uppercase tracking-widest">{currentStep + 1} / {steps.length}</span>
        </div>
        
        <p className="text-on-surface-variant text-sm leading-relaxed">
          {step.content}
        </p>

        <div className="flex justify-between items-center mt-2">
          <button onClick={closeTour} className="text-[#a6abba] text-xs hover:text-white transition-colors uppercase font-bold tracking-widest">
            Skip Tour
          </button>
          <button 
            onClick={handleNext} 
            className="bg-[#00e3fd] text-[#090e19] px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors"
          >
            {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .walkthrough-tail {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: drawTail 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards infinite;
        }
        @keyframes drawTail {
          0% {
            stroke-dashoffset: 1000;
          }
          50% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
      `}} />
    </>
  );
}
