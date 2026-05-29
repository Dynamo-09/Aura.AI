import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

interface ChatbotProps {
  selectedStock: string;
  voiceFeedback?: boolean;
  voiceType?: string;
}

const Chatbot: React.FC<ChatbotProps> = ({ selectedStock, voiceFeedback = true, voiceType = 'female-en-in' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'ai', text: 'Hello! I am Aura, your AI intelligence assistant. Ask me anything about the market or your currently selected stock.' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Ensure voices are loaded (Chrome sometimes loads them async)
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  const speakIndianFemaleAccent = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (!voiceFeedback) return;
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    
    let preferredVoice;
    
    if (voiceType === 'male-en-us') {
      preferredVoice = voices.find(v => v.lang === 'en-US' && v.name.toLowerCase().includes('male'));
      utterance.pitch = 0.9;
      utterance.rate = 1.2;
    } else if (voiceType === 'female-en-gb') {
      preferredVoice = voices.find(v => v.lang === 'en-GB' && v.name.toLowerCase().includes('female'));
      utterance.pitch = 1.0;
      utterance.rate = 0.8;
    } else {
      // Default female-en-in
      preferredVoice = voices.find(v => 
          (v.lang === 'en-IN' || v.lang === 'hi-IN') && 
          (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('neerja') || v.name.toLowerCase().includes('veera') || v.name.toLowerCase().includes('google'))
      );
      if (!preferredVoice) preferredVoice = voices.find(v => v.lang.includes('IN'));
      utterance.pitch = 1.2;
      utterance.rate = 1.0;
    }
    
    if (preferredVoice) utterance.voice = preferredVoice;
    
    window.speechSynthesis.speak(utterance);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputValue.trim()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: userMsg.text, 
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
      speakIndianFemaleAccent(aiMsg.text);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "System communication error. Please ensure the backend server is running."
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button
        onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen && 'speechSynthesis' in window) window.speechSynthesis.cancel();
        }}
        className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded border transition-colors relative shadow-lg
                  ${isOpen ? 'bg-[#1e3a8a]/40 text-blue-400 border-blue-500/30' : 'bg-[#0f172a]/90 text-[#8b9bb4] border-[#1e293b] hover:bg-[#1e293b] hover:text-white'}`}
      >
        <MessageSquare className={`w-4 h-4 transition-colors ${isOpen ? 'text-blue-400' : ''}`} />
        <span>Aura Chat</span>
        {!isOpen && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping opacity-60"></span>}
      </button>

      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end pointer-events-none">
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="w-80 sm:w-96 h-[500px] bg-[#0a0f1e]/95 backdrop-blur-xl border border-[#1e293b] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] mb-4 flex flex-col overflow-hidden origin-bottom-right pointer-events-auto"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border-b border-[#1e293b] flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center shadow-[0_0_10px_rgba(99,102,241,0.5)]">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm tracking-wide">Aura Assistant</h3>
                  <p className="text-[10px] text-emerald-400 font-medium tracking-widest uppercase flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                    Online
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                   setIsOpen(false);
                   if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                }}
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                title="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.sender === 'user' ? 'bg-[#1e293b] ml-2' : 'bg-indigo-500/20 border border-indigo-500/30 mr-2'}`}>
                      {msg.sender === 'user' ? <User className="w-3.5 h-3.5 text-slate-400" /> : <Bot className="w-3.5 h-3.5 text-indigo-400" />}
                    </div>
                    <div className={`p-3 rounded-2xl relative text-sm shadow-md whitespace-pre-wrap leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-sm' 
                        : 'bg-[#111827] border border-[#1e293b] text-slate-300 rounded-tl-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex bg-[#111827] border border-[#1e293b] p-3 rounded-2xl rounded-tl-sm shadow-md items-center space-x-1 ml-8">
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-[#0a0f1e] border-t border-[#1e293b]">
              <form onSubmit={handleSend} className="relative flex items-center">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={selectedStock ? `Ask Aura about ${selectedStock}...` : "Ask Aura about the market..."}
                  className="w-full bg-[#111827] border border-[#1e293b] text-white text-sm rounded-full py-2.5 pl-4 pr-12 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-500"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="absolute right-1.5 top-1.5 w-7 h-7 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
                >
                  <Send className="w-3.5 h-3.5 ml-[-2px]" />
                </button>
              </form>
            </div>
            
            {/* The little tail pointing to the FAB */}
            <div className="absolute -bottom-3 right-6 w-6 h-6 bg-[#0a0f1e] border-b border-r border-[#1e293b] rotate-45 transform translate-y-[-50%] z-[-1]" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
};

export default Chatbot;
