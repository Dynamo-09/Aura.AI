import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';

// Types for Speech Recognition
interface ISpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onerror: ((event: SpeechErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  abort: () => void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => ISpeechRecognition;
    webkitSpeechRecognition?: new () => ISpeechRecognition;
  }
}

interface SpeechResultEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      0: { transcript: string; confidence: number };
    };
  };
}

interface SpeechErrorEvent {
  error: string;
}

interface VoiceAssistantProps {
  selectedStock: string;
  onAction?: (action: string, payload: string) => void;
  voiceFeedback?: boolean;
  voiceType?: string;
  userName?: string;
}

type AssistantState = 'IDLE' | 'WOKEN' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'ANIMATING';

const SpeechRecognitionAPI = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : undefined;
const recognitionSingleton = SpeechRecognitionAPI ? new SpeechRecognitionAPI() : null;
if (recognitionSingleton) {
    recognitionSingleton.continuous = true;
    recognitionSingleton.interimResults = true;
    recognitionSingleton.lang = 'en-IN';
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ selectedStock, onAction, voiceFeedback = true, voiceType = 'female-en-in', userName }) => {
  const [state, setState] = useState<AssistantState>('IDLE');
  const [subtitle, setSubtitle] = useState('');
  const [cursorTarget, setCursorTarget] = useState<'NONE'|'STOCK'|'TAB'|'CURRENCY'>('NONE');
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const sleepTimeoutRef = useRef<number | null>(null);
  const chatHistoryRef = useRef<{role: string, text: string}[]>([]);

  const latestOnAction = useRef(onAction);
  const latestSelectedStock = useRef(selectedStock);
  const latestSpeak = useRef<typeof speak | null>(null);
  const latestUserName = useRef(userName);
  const latestHandleWakeUp = useRef<typeof handleWakeUp | null>(null);
  const latestProcessUserCommand = useRef<typeof processUserCommand | null>(null);

  useEffect(() => {
    latestOnAction.current = onAction;
    latestSelectedStock.current = selectedStock;
    latestUserName.current = userName;
  }, [onAction, selectedStock, userName]);
  
  // Initialize speech recognition
  useEffect(() => {
    if (!recognitionSingleton) {
      console.warn("Speech Recognition API is not supported in this browser.");
      return;
    }

    const recognition = recognitionSingleton;

    const resetSleepTimer = () => {
       if (sleepTimeoutRef.current) {
          clearTimeout(sleepTimeoutRef.current);
          sleepTimeoutRef.current = null;
       }
    };

    recognition.onresult = (event: SpeechResultEvent) => {
      resetSleepTimer();

      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript.toLowerCase();
        } else {
          interimTranscript += event.results[i][0].transcript.toLowerCase();
        }
      }

      const fullTranscript = finalTranscript || interimTranscript;

      // Current state logic
      setState((currentState: AssistantState) => {
        // Wake Word Detection
        if (currentState === 'IDLE') {
          console.log("[AURA STT]", "Heard:", fullTranscript); // Debug helper
          
          // Highly forgiving regex for Indian-English STT outputs
          const isWakeWord = /\b(hi|hey|hello|hai)\b.*(aura|ora|ara|hiora)\b/i.test(fullTranscript) || 
                             fullTranscript.replace(/\s+/g,'').includes('hiaura') ||
                             fullTranscript.includes('hi aura');

          if (isWakeWord) {
             if (latestHandleWakeUp.current) latestHandleWakeUp.current();
             return 'THINKING';
          }
        } 
        // Active Listening Command Detection
        else if (currentState === 'LISTENING' && finalTranscript) {
           let sanitized = finalTranscript.replace(/\by\b/gi, 'why');
           sanitized = sanitized.replace(/\bu\b/gi, 'you');
           
           // Train STT normalization for all Chatbot FAQ strings
           sanitized = sanitized.replace(/intra day/gi, 'intraday');
           sanitized = sanitized.replace(/s and p 500|sp 500|s & p 500/gi, 's&p 500');
           sanitized = sanitized.replace(/d mat|deemat|the mat/gi, 'demat');
           sanitized = sanitized.replace(/sense x/gi, 'sensex');
           sanitized = sanitized.replace(/nif tea|nifty fifty/gi, 'nifty');
           sanitized = sanitized.replace(/bullish/gi, 'bull');
           sanitized = sanitized.replace(/bearish/gi, 'bear');
           sanitized = sanitized.replace(/neutral fund|mutual fun/gi, 'mutual fund');
           
           if (latestProcessUserCommand.current) latestProcessUserCommand.current(sanitized);
           return 'THINKING';
        }
        return currentState;
      });

      // Update subtitles if active
      setState((currentState: AssistantState) => {
         if (currentState === 'LISTENING' && fullTranscript) {
            setSubtitle(`You: "${fullTranscript}"`);
         }
         return currentState;
      });
    };

    recognition.onerror = (event: SpeechErrorEvent) => {
        // Automatically restart listening on errors like no-speech timeout to maintain background listening
        // Added setTimeout to prevent infinite tight-loops causing microphone request flickering
        if (event.error !== 'aborted') {
            if (event.error !== 'no-speech') {
                console.error("Speech Recognition Error:", event.error);
                let errorMsg = `Mic Error: ${event.error}. Ensure browser has permission.`;
                if (event.error === 'network') {
                    errorMsg = "Speech API Network Error: Using Brave? Brave blocks Speech Recognition for privacy. Please use Google Chrome or Edge.";
                }
                // Temporarily show the error to the user for debugging
                setSubtitle(errorMsg);
                setTimeout(() => setSubtitle(''), 6000);
            }
            setTimeout(() => {
                try { recognition.start(); } catch (e) { /* ignore */ }
            }, 1000);
        }
    };

    recognition.onend = () => {
      // Continuous loop with delay to prevent infinite flickering loop
      setTimeout(() => {
          try { recognition.start(); } catch (e) { /* ignore */ }
      }, 1000);
    };

    recognitionRef.current = recognition;
    try {
        recognition.start();
    } catch(e) {
        console.warn("Autoplay block: mic permission needed.");
    }

    // Keep a persistent dummy audio stream alive to force Bluetooth headsets to stay in Hands-Free profile
    let persistentStream: MediaStream | null = null;
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
          persistentStream = stream;
      })
      .catch(err => {
          console.error("Failed to acquire persistent mic stream:", err);
      });

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      }
      if (persistentStream) {
          persistentStream.getTracks().forEach(track => track.stop());
      }
      if (sleepTimeoutRef.current) clearTimeout(sleepTimeoutRef.current);
      window.speechSynthesis.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency to only mount once

  // Ensure voices are loaded (Chrome sometimes loads them async)
  useEffect(() => {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }, []);

  const speak = useCallback((text: string, onEnd?: () => void, speed: number = 0.9) => {
    window.speechSynthesis.cancel();
    
    if (!voiceFeedback) {
        setState('SPEAKING');
        setTimeout(() => {
            if (onEnd) onEnd();
        }, 1500); // Simulate reading time
        return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Find voice based on settings
    const voices = window.speechSynthesis.getVoices();
    let preferredVoice;
    
    if (voiceType === 'male-en-us') {
      preferredVoice = voices.find(v => v.lang === 'en-US' && v.name.toLowerCase().includes('male')) || voices.find(v => v.lang === 'en-US');
      utterance.pitch = 0.9;
      utterance.rate = speed * 1.2;
    } else if (voiceType === 'female-en-gb') {
      preferredVoice = voices.find(v => v.lang === 'en-GB' && v.name.toLowerCase().includes('female')) || voices.find(v => v.lang === 'en-GB');
      utterance.pitch = 1.0;
      utterance.rate = speed * 0.8;
    } else {
      // Default female-en-in
      preferredVoice = voices.find(v => 
          (v.lang === 'en-IN' || v.lang === 'hi-IN') && 
          (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('neerja') || v.name.toLowerCase().includes('veera') || v.name.toLowerCase().includes('google'))
      );
      if (!preferredVoice) {
        preferredVoice = voices.find(v => v.lang.includes('IN')); 
      }
      utterance.pitch = 1.2; // Slightly higher for friendly a female AI tone
      utterance.rate = speed;
    }

    if (preferredVoice) utterance.voice = preferredVoice;

    let isFinished = false;

    utterance.onstart = () => {
       setState('SPEAKING');
    }

    utterance.onend = () => {
       if (isFinished) return;
       isFinished = true;
       if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
       console.warn("Speech synthesis playback error (Autoplay might be blocked):", e);
       if (isFinished) return;
       isFinished = true;
       if (onEnd) onEnd();
    };
    
    synthesisRef.current = utterance;

    // Safety fallback in case browser silently drops it entirely
    const fallbackTime = (text.length / 15) * 1000 + 2000;
    setTimeout(() => {
        if (!isFinished) {
            isFinished = true;
            if (onEnd) onEnd();
        }
    }, fallbackTime);

    window.speechSynthesis.speak(utterance);
  }, [voiceFeedback, voiceType]);

  const startSleepTimer = useCallback(() => {
     if (sleepTimeoutRef.current) clearTimeout(sleepTimeoutRef.current);
     sleepTimeoutRef.current = window.setTimeout(() => {
         setState('SPEAKING');
         setSubtitle("I am not getting any questions, I am going to sleep again. If you have any questions further,just wake me up again");
         speak("I am not getting any questions, I am going to sleep again. If you have any questions further,just wake me up again", () => {
             setState('IDLE');
             setSubtitle('');
         });
     }, 15000);
  }, [speak]);

  // Expose to window temporarily so onresult closure can access the latest function without complex dependency injection
  useEffect(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).startSleepTimerRef = startSleepTimer;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return () => { (window as any).startSleepTimerRef = null; };
  }, [startSleepTimer]);

  const handleWakeUp = useCallback(() => {
     if (sleepTimeoutRef.current) clearTimeout(sleepTimeoutRef.current);

     const nameToSay = userName || "User";
     setSubtitle(`Hi ${nameToSay}, how can I help you?`);
     speak(`Hi ${nameToSay}, how can I help you?`, () => {
         setState('LISTENING');
         setSubtitle("Listening...");
         if (recognitionRef.current) {
             recognitionRef.current.abort();
             setTimeout(() => recognitionRef.current?.start(), 100);
         }
         startSleepTimer();
     });
  }, [userName, speak, startSleepTimer]);

  const processUserCommand = useCallback(async (command: string) => {
      setSubtitle(`Thinking...`);
      const currentHistory = [...chatHistoryRef.current];
      
      // Client-side hardcoded commands
      const lowerCommand = command.toLowerCase();
      
      // Handle Navigation
      const navMatch = lowerCommand.match(/(?:take me to|go to|open|navigate to)(?:\s+the)?\s+(.+)/);
      if (navMatch) {
          const target = navMatch[1].trim();
          let path = '';
          if (target.includes('command') || target.includes('dashboard')) path = '/dashboard';
          else if (target.includes('market') || target.includes('pulse') || target.includes('analysis')) path = '/analysis';
          else if (target.includes('scanner')) path = '/ai-scanner';
          else if (target.includes('neural') || target.includes('intelligence')) path = '/neural-intelligence';
          else if (target.includes('assistant') || target.includes('aura')) path = '/aura-assistant';
          else if (target.includes('portfolio')) path = '/portfolio';
          else if (target.includes('setting')) path = '/settings';

          if (path) {
              setSubtitle(`Taking you to ${target}`);
              speak(`Taking you to ${target}`, () => {
                  if (latestOnAction.current) latestOnAction.current('NAVIGATE', path);
                  setState('IDLE');
                  setSubtitle('');
              });
              return;
          }
      }

      // Handle Show Stock
      const showMatch = lowerCommand.match(/(?:show me|search for)\s+(.+)/);
      if (showMatch) {
          let targetStock = showMatch[1].trim();
          targetStock = targetStock.replace(/^(the\s+stock\s+of|stock\s+of|the\s+)\s*/i, '').trim();
          targetStock = targetStock.replace(/\s+stock$/i, '').trim().toUpperCase();
          setSubtitle(`Showing you ${targetStock}`);
          speak(`Showing you ${targetStock}`, () => {
              if (latestOnAction.current) latestOnAction.current('CHANGE_STOCK', targetStock);
              setState('IDLE');
              setSubtitle('');
          });
          return;
      }

      // Handle Currency Change
      const currencyMatch = lowerCommand.match(/change.*currency to (.+)/);
      if (currencyMatch) {
          const currencyName = currencyMatch[1].trim();
          let code = '';
          if (currencyName.includes('usd') || currencyName.includes('dollar') && !currencyName.includes('australian') && !currencyName.includes('hong')) code = 'USD';
          else if (currencyName.includes('inr') || currencyName.includes('rupee')) code = 'INR';
          else if (currencyName.includes('pound')) code = 'POUND';
          else if (currencyName.includes('euro')) code = 'EURO';
          else if (currencyName.includes('australian')) code = 'Australian Dollar';
          else if (currencyName.includes('hong')) code = 'Hong Kong Dollar';

          if (code) {
              setSubtitle(`Changing currency to ${code}`);
              speak(`Changing currency to ${code}`, () => {
                  if (latestOnAction.current) latestOnAction.current('CHANGE_CURRENCY', code);
                  setState('IDLE');
                  setSubtitle('');
              });
              return;
          }
      }

      // Handle Delete / Logout Account
      if (lowerCommand.includes('delete my account') || lowerCommand.includes('logout')) {
          const isDelete = lowerCommand.includes('delete');
          setSubtitle(`Are you sure you want to ${isDelete ? 'delete your account' : 'log out'}?`);
          speak(`Are you sure you want to ${isDelete ? 'delete your account' : 'log out'}?`, () => {
              setState('LISTENING');
              setSubtitle('Listening...');
              if (recognitionRef.current) {
                  recognitionRef.current.abort();
                  setTimeout(() => recognitionRef.current?.start(), 100);
              }
              // Set a specific state for confirmation via history or context
              chatHistoryRef.current = [{ role: 'system', text: isDelete ? 'AWAITING_DELETE_CONFIRMATION' : 'AWAITING_LOGOUT_CONFIRMATION' }];
          });
          return;
      }

      if (currentHistory.length > 0 && (currentHistory[currentHistory.length-1].text === 'AWAITING_LOGOUT_CONFIRMATION' || currentHistory[currentHistory.length-1].text === 'AWAITING_DELETE_CONFIRMATION')) {
          const actionType = currentHistory[currentHistory.length-1].text;
          chatHistoryRef.current = []; // clear
          if (lowerCommand.includes('yes') || lowerCommand.includes('yeah') || lowerCommand.includes('sure') || lowerCommand.includes('yep')) {
              if (actionType === 'AWAITING_DELETE_CONFIRMATION') {
                  setSubtitle("Account deleted. Goodbye.");
                  speak("Account deleted. Goodbye.", () => {
                      if (latestOnAction.current) latestOnAction.current('DELETE_ACCOUNT', '');
                      setState('IDLE');
                      setSubtitle('');
                  });
              } else {
                  setSubtitle("Logging you out. Goodbye.");
                  speak("Logging you out. Goodbye.", () => {
                      if (latestOnAction.current) latestOnAction.current('LOGOUT', '');
                      setState('IDLE');
                      setSubtitle('');
                  });
              }
              return;
          } else {
              setSubtitle("Action cancelled.");
              speak("Action cancelled.", () => {
                  setState('IDLE');
                  setSubtitle('');
              });
              return;
          }
      }

      try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                query: command, 
                stock: latestSelectedStock.current,
                history: currentHistory
            })
          });
          
          if (!response.ok) throw new Error('API Error');
          const data = await response.json();
          
          chatHistoryRef.current = [
              ...currentHistory,
              { role: 'user', text: command },
              { role: 'ai', text: data.response }
          ];

          if (data.action) {
              setState('ANIMATING');
              
              let target: 'NONE'|'STOCK'|'TAB'|'CURRENCY' = 'NONE';
              if (data.action === 'CHANGE_STOCK') target = 'STOCK';
              if (data.action === 'CHANGE_TAB') target = 'TAB';
              if (data.action === 'CHANGE_CURRENCY') target = 'CURRENCY';
              setCursorTarget(target);
              
              setTimeout(() => {
                  if (latestOnAction.current) latestOnAction.current(data.action, data.payload);
                  setCursorTarget('NONE');
                  
                  setSubtitle(data.response);
                  speak(data.response, () => {
                      const endsWithQuestion = data.response.trim().endsWith('?');
                      if (endsWithQuestion) {
                          setState('LISTENING');
                          setSubtitle('Listening...');
                          if (recognitionRef.current) {
                              recognitionRef.current.abort();
                              setTimeout(() => recognitionRef.current?.start(), 100);
                          }
                          startSleepTimer();
                      } else {
                          setState('WOKEN');
                          setTimeout(() => {
                              setState('IDLE');
                              setSubtitle('');
                          }, 2000);
                      }
                  }, data.speed || 0.9);
              }, 1500);
          } else {
              setSubtitle(data.response);
              speak(data.response, () => {
                  const endsWithQuestion = data.response.trim().endsWith('?');
                  if (endsWithQuestion) {
                      setState('LISTENING');
                      setSubtitle('Listening...');
                      if (recognitionRef.current) {
                          recognitionRef.current.abort();
                          setTimeout(() => recognitionRef.current?.start(), 100);
                      }
                      startSleepTimer();
                  } else {
                      setState('WOKEN');
                      setTimeout(() => {
                          setState('IDLE');
                          setSubtitle('');
                      }, 2000);
                  }
              }, data.speed || 0.9);
          }
      } catch (e) {
          const errorMsg = "Sorry, I am having trouble connecting to my neural network.";
          setSubtitle(errorMsg);
          speak(errorMsg, () => {
              setState('IDLE');
              setSubtitle('');
          });
      }
  }, [speak, startSleepTimer]);

  useEffect(() => {
      latestSpeak.current = speak;
      latestHandleWakeUp.current = handleWakeUp;
      latestProcessUserCommand.current = processUserCommand;
  }, [speak, handleWakeUp, processUserCommand]);

  // Unified Rendering logic
  return (
    <>
      {/* Sidebar Button */}
      <button 
         onClick={() => handleWakeUp()}
         className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded border transition-colors relative shadow-lg
                  ${state !== 'IDLE' ? 'bg-[#1e3a8a]/40 text-cyan-400 border-cyan-500/30' : 'bg-[#0f172a]/90 text-[#8b9bb4] border-[#1e293b] hover:bg-[#1e293b] hover:text-white'}`}
         title="Manually wake Voice Assistant"
      >
         <Mic className={`w-4 h-4 transition-colors ${state !== 'IDLE' ? 'text-cyan-400' : ''}`} />
         <span>Aura Voice</span>
         <span className={`absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-500 rounded-full ${state !== 'IDLE' ? 'opacity-0' : 'shadow-[0_0_5px_rgba(16,185,129,0.8)]'}`}>
            <span className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75"></span>
         </span>
      </button>

      {/* Subtitles Overlay when IDLE */}
      {state === 'IDLE' && subtitle && (
        <div className="fixed bottom-20 right-6 z-[100] px-4 py-2 bg-slate-900/80 backdrop-blur-md text-white rounded-lg text-sm border border-slate-700 shadow-xl pointer-events-none text-right">
            {subtitle}
        </div>
      )}

      {/* AI Face UI Components when NOT IDLE */}
      {state !== 'IDLE' && (
        <div className="fixed inset-0 z-[200] pointer-events-none flex flex-col items-center justify-center">
            {/* Dark dimming background when Aura is active */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-950"
            />

            {/* The Aura Face */}
            <motion.div
                initial={{ scale: 0, opacity: 0, y: 50 }}
                animate={
                    state === 'ANIMATING' 
                    ? { 
                        scale: 0.3, 
                        opacity: 1, 
                        x: cursorTarget !== 'NONE' ? (window.innerWidth / 2) - 150 : 0, 
                        y: cursorTarget !== 'NONE' ? -(window.innerHeight / 2) + 60 : 0 
                      }
                    : { 
                        scale: 1, 
                        opacity: 1, 
                        x: 0,
                        y: state === 'SPEAKING' ? [0, -15, 0] : [0, -5, 0] 
                    }
                }
                transition={{ 
                    scale: { type: "spring", stiffness: 200, damping: 20 },
                    y: { duration: state === 'SPEAKING' ? 1.5 : (state === 'ANIMATING' ? 0.8 : 3), repeat: state === 'SPEAKING' || (state !== 'ANIMATING') ? Infinity : 0, ease: 'easeInOut' },
                    x: { duration: 0.8, ease: 'easeInOut' }
                }}
                className="relative w-40 h-40 rounded-full bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 shadow-[0_0_80px_rgba(56,189,248,0.5)] flex items-center justify-center pointer-events-auto"
            >
                {/* Fake Mouse Cursor Ping when animating */}
                {state === 'ANIMATING' && (
                    <motion.div 
                       initial={{ opacity: 0, scale: 0 }}
                       animate={{ opacity: [0, 1, 0], scale: [0, 2, 4] }}
                       transition={{ delay: 1, duration: 0.5 }}
                       className="absolute -right-20 -top-10 w-20 h-20 rounded-full border-4 border-white/50"
                    />
                )}
                {/* Inner Face Elements */}
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                    
                    {/* Eyes Container */}
                    <div className="flex space-x-8 mb-4">
                        {/* Left Eye */}
                        <motion.div 
                            animate={{ scaleY: [1, 1, 0.1, 1, 1] }} 
                            transition={{ duration: 4, repeat: Infinity, times: [0, 0.9, 0.95, 0.98, 1] }}
                            className="w-4 h-6 bg-white rounded-full shadow-inner" 
                        />
                        {/* Right Eye */}
                        <motion.div 
                            animate={{ scaleY: [1, 1, 0.1, 1, 1] }} 
                            transition={{ duration: 4, repeat: Infinity, times: [0, 0.9, 0.95, 0.98, 1] }} 
                            className="w-4 h-6 bg-white rounded-full shadow-inner" 
                        />
                    </div>

                    {/* Mouth */}
                    <motion.div
                        animate={
                            state === 'SPEAKING' 
                            ? { 
                                height: [4, 20, 8, 16, 4], 
                                width: [20, 30, 24, 28, 20],
                                borderRadius: ["10px", "20px", "15px", "20px", "10px"] 
                              } 
                            : state === 'THINKING' 
                            ? { height: 4, width: 12, borderRadius: "10px" } 
                            : { 
                                height: 12, 
                                width: 32, 
                                borderBottomLeftRadius: "16px", 
                                borderBottomRightRadius: "16px",
                                borderTopLeftRadius: "4px",
                                borderTopRightRadius: "4px"
                              }
                        }
                        transition={
                            state === 'SPEAKING' 
                            ? { duration: 0.5, repeat: Infinity, repeatType: 'mirror' } 
                            : { duration: 0.3 }
                        }
                        className="bg-white"
                    />
                </div>

                {/* Glowing Ring effect when speaking */}
                {state === 'SPEAKING' && (
                    <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute inset-0 rounded-full border-4 border-cyan-300"
                    />
                )}
            </motion.div>

            {/* Subtitles Overlay */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12 max-w-2xl px-8 py-4 bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl z-50 text-center pointer-events-auto"
            >
                <p className="text-xl font-medium text-white tracking-wide leading-relaxed">
                    {subtitle}
                </p>
            </motion.div>
            
            {/* Manual Dismiss button */}
            <button 
               onClick={() => { setState('IDLE'); window.speechSynthesis.cancel(); }}
               className="mt-6 text-slate-400 hover:text-white pointer-events-auto text-sm underline"
            >
               Dismiss
            </button>
        </div>
      )}
    </>
  );
};

export default VoiceAssistant;
