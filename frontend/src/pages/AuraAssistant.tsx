import { useState, useRef, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { OutletContextData } from '../components/Layout';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

export default function AuraAssistant() {
  const { selectedStock } = useOutletContext<OutletContextData>();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: text, 
          stock: selectedStock,
          history: messages.map(m => ({ role: m.sender, text: m.text }))
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.response || "I'm having trouble connecting to my neural network right now."
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "Sorry, the neural link was interrupted. Please try again."
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend(query);
    }
  };

  return (
    <div className="pt-8 flex-1 flex flex-col h-[calc(100vh-120px)] relative">
      {/* Atmospheric Background Element */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -right-20 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 -left-20 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]"></div>
      </div>
      
      {/* Chat Canvas */}
      <div className="flex-1 overflow-y-auto px-8 py-4 scroll-smooth">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* AI Greeting & Hero */}
          <div className="flex flex-col items-center text-center space-y-6 pt-10 pb-4">
            <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center shadow-[0px_0px_15px_rgba(0,227,253,0.12)] border border-secondary/20">
              <span className="material-symbols-outlined text-4xl text-secondary" style={{fontVariationSettings: "'FILL' 1"}}>auto_awesome</span>
            </div>
            <div className="space-y-2">
              <h1 className="font-headline text-5xl font-bold tracking-tight text-on-surface leading-tight">
                Welcome back. <br/>
                <span className="text-secondary">How shall we synthesize the markets today?</span>
              </h1>
              <p className="text-on-surface-variant text-lg max-w-xl mx-auto">
                I'm currently scanning 14,000+ global assets for volatility anomalies and sentiment shifts.
              </p>
            </div>
          </div>
          
          {/* Suggested Actions Bento-ish Grid (only show if no messages) */}
          {messages.length === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => handleSend("Scan my current holdings for risk exposure and tax-loss harvesting opportunities.")}
                className="bg-surface-container-low p-6 rounded-xl text-left border border-outline-variant/10 hover:bg-surface-container-high hover:border-secondary/30 transition-all group">
                <span className="material-symbols-outlined text-secondary mb-4">analytics</span>
                <h3 className="font-headline font-bold text-on-surface mb-1">Portfolio Audit</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">Scan my current holdings for risk exposure and tax-loss harvesting opportunities.</p>
              </button>
              <button 
                onClick={() => handleSend("Identify 3 assets with high conviction AI sentiment scores above 85%.")}
                className="bg-surface-container-low p-6 rounded-xl text-left border border-outline-variant/10 hover:bg-surface-container-high hover:border-secondary/30 transition-all group">
                <span className="material-symbols-outlined text-secondary mb-4">trending_up</span>
                <h3 className="font-headline font-bold text-on-surface mb-1">High-Signal Trades</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">Identify 3 assets with high conviction AI sentiment scores above 85%.</p>
              </button>
              <button 
                onClick={() => handleSend("Summarize the impact of latest inflation data on tech sector liquidity.")}
                className="bg-surface-container-low p-6 rounded-xl text-left border border-outline-variant/10 hover:bg-surface-container-high hover:border-secondary/30 transition-all group">
                <span className="material-symbols-outlined text-secondary mb-4">public</span>
                <h3 className="font-headline font-bold text-on-surface mb-1">Macro Briefing</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">Summarize the impact of latest inflation data on tech sector liquidity.</p>
              </button>
            </div>
          )}
          
          {/* Chat History */}
          <div className="space-y-8 pb-32">
            {messages.map((msg) => {
              if (msg.sender === 'ai') {
                return (
                  <div key={msg.id} className="flex gap-6 max-w-3xl">
                    <div className="w-10 h-10 rounded-full bg-surface-container-highest flex-shrink-0 flex items-center justify-center border border-secondary/20">
                      <span className="material-symbols-outlined text-secondary text-sm" style={{fontVariationSettings: "'FILL' 1"}}>auto_awesome</span>
                    </div>
                    <div className="space-y-3 pt-2">
                      <div className="text-[10px] tracking-widest font-bold text-secondary uppercase font-label">Aura Assistant</div>
                      <div className="text-on-surface leading-relaxed text-sm bg-surface-container-high/50 p-5 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl border-l-2 border-secondary shadow-lg backdrop-blur-[20px]">
                        {msg.text}
                      </div>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div key={msg.id} className="flex gap-6 max-w-3xl ml-auto flex-row-reverse">
                    <div className="w-10 h-10 rounded-full bg-surface-container-highest flex-shrink-0 overflow-hidden border border-primary/20">
                      <img alt="User Profile" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256&h=256"/>
                    </div>
                    <div className="space-y-3 pt-2 text-right">
                      <div className="text-[10px] tracking-widest font-bold text-primary uppercase font-label">You</div>
                      <div className="text-on-surface leading-relaxed text-sm bg-primary/10 p-5 rounded-tl-2xl rounded-bl-2xl rounded-br-2xl border-r-2 border-primary/40 backdrop-blur-[20px]">
                        {msg.text}
                      </div>
                    </div>
                  </div>
                );
              }
            })}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-6 max-w-3xl">
                <div className="w-10 h-10 rounded-full bg-surface-container-highest flex-shrink-0 flex items-center justify-center border border-secondary/20">
                  <span className="material-symbols-outlined text-secondary text-sm animate-pulse" style={{fontVariationSettings: "'FILL' 1"}}>auto_awesome</span>
                </div>
                <div className="space-y-3 pt-2">
                  <div className="text-[10px] tracking-widest font-bold text-secondary uppercase font-label">Aura Assistant</div>
                  <div className="text-on-surface leading-relaxed text-sm bg-surface-container-high/50 p-5 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl border-l-2 border-secondary shadow-lg backdrop-blur-[20px] flex gap-2 items-center h-12">
                    <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                    <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
      
      {/* Chat Input Area */}
      <div className="absolute bottom-0 left-0 right-0 p-8 pt-0 pointer-events-none">
        <div className="max-w-4xl mx-auto pointer-events-auto">
          <div className="bg-surface-container-highest p-2 rounded-full border border-outline-variant/20 shadow-[0px_0px_15px_rgba(0,227,253,0.12)] flex items-center backdrop-blur-[20px] group focus-within:border-secondary transition-all">
            <button className="w-12 h-12 flex items-center justify-center text-on-surface-variant hover:text-secondary transition-colors">
              <span className="material-symbols-outlined">attach_file</span>
            </button>
            <input 
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-4 px-4 text-on-surface placeholder:text-on-surface-variant/50 placeholder:text-[10px] placeholder:tracking-widest placeholder:uppercase font-headline outline-none" 
              placeholder="ASK AURA ABOUT TRENDS, ASSETS, OR ALGORITHMIC SIGNALS..." 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <div className="flex items-center gap-2 pr-2">
              <button className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-secondary transition-colors">
                <span className="material-symbols-outlined">mic</span>
              </button>
              <button 
                onClick={() => handleSend(query)}
                className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-primary-container flex items-center justify-center text-on-primary-fixed shadow-lg hover:shadow-primary/30 transition-all active:scale-95 group">
                <span className="material-symbols-outlined group-hover:translate-x-0.5 transition-transform">send</span>
              </button>
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-4 pb-4">
            <span className="text-[8px] uppercase tracking-[0.2em] text-on-surface-variant/40">Powered by Oracle-v4 Engine</span>
            <span className="text-[8px] uppercase tracking-[0.2em] text-on-surface-variant/40">Real-time market feed active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
