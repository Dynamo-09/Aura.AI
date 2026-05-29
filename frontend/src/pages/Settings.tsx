import { useState, useEffect, useRef } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import type { OutletContextData } from '../components/Layout';

export default function Settings() {
  const navigate = useNavigate();
  const { 
    userName, setUserName, 
    email, setEmail,
    currency, setCurrency, 
    profilePicUrl, setProfilePicUrl,
    theme, setTheme,
    chartColors, setChartColors,
    voiceFeedback, setVoiceFeedback,
    voiceType, setVoiceType,
    defaultMarket, setDefaultMarket,
    defaultIndicators, setDefaultIndicators,
    refreshRate, setRefreshRate,
    aiModel, setAiModel
  } = useOutletContext<OutletContextData>();

  // Profile Form State
  const [profileName, setProfileName] = useState(userName);
  const [profileEmail, setProfileEmail] = useState(email);

  // New Settings States
  const [localTheme, setLocalTheme] = useState(theme);
  const [localChartColors, setLocalChartColors] = useState(chartColors);
  const [localVoiceFeedback, setLocalVoiceFeedback] = useState(voiceFeedback);
  const [localVoiceType, setLocalVoiceType] = useState(voiceType);
  const [localDefaultMarket, setLocalDefaultMarket] = useState(defaultMarket);
  
  // Multi-select state
  const [localDefaultIndicators, setLocalDefaultIndicators] = useState(defaultIndicators);
  const toggleIndicator = (ind: string) => {
    setLocalDefaultIndicators(prev => 
      prev.includes(ind) ? prev.filter(i => i !== ind) : [...prev, ind]
    );
  };

  const [localRefreshRate, setLocalRefreshRate] = useState(refreshRate);
  const [apiKey, setApiKey] = useState('');

  // Preference State
  const [localAiModel, setLocalAiModel] = useState(aiModel);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Status States
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync profileName if userName changes externally
  useEffect(() => {
    setProfileName(userName);
  }, [userName]);

  const handleGlobalSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setUserName(profileName);
      setEmail(profileEmail);
      setTheme(localTheme);
      setChartColors(localChartColors);
      setVoiceFeedback(localVoiceFeedback);
      setVoiceType(localVoiceType);
      setDefaultMarket(localDefaultMarket);
      setDefaultIndicators(localDefaultIndicators);
      setRefreshRate(localRefreshRate);
      setAiModel(localAiModel);
      setIsSaving(false);
      setSavedMessage('All settings saved successfully.');
      setTimeout(() => setSavedMessage(''), 3000);
    }, 800);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicUrl(reader.result as string);
        setSavedMessage('Avatar updated successfully.');
        setTimeout(() => setSavedMessage(''), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerAvatarUpload = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to permanently delete your account and all portfolio data? This cannot be undone.")) {
      setSavedMessage("Deleting account...");
      setTimeout(() => {
        localStorage.clear();
        navigate('/');
      }, 1500);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in relative z-10 pb-24">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight text-on-surface">Settings</h1>
          <p className="text-on-surface-variant font-body mt-2">Configure your synthesized oracle experience</p>
        </div>
      </div>

      {savedMessage && (
        <div className="bg-secondary/10 border border-secondary text-secondary px-6 py-3 rounded-lg flex items-center gap-3 animate-fade-in fixed top-24 left-1/2 -translate-x-1/2 z-[200] shadow-2xl backdrop-blur-md">
          <span className="material-symbols-outlined">check_circle</span>
          <span className="font-bold text-sm">{savedMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* PROFILE SETTINGS */}
          <div className="bg-surface-container border border-outline-variant/20 rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
            <h2 className="text-xl font-bold font-headline text-on-surface mb-6 flex items-center">
              <span className="material-symbols-outlined mr-3 text-primary">person</span>
              Profile Identity
            </h2>
            
            <div className="flex items-center gap-6 mb-8">
              <div onClick={triggerAvatarUpload} className="w-24 h-24 rounded-full border-2 border-secondary/30 overflow-hidden relative group cursor-pointer">
                <img src={profilePicUrl} alt="Profile" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="material-symbols-outlined text-white">photo_camera</span>
                </div>
              </div>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" />
              <div>
                <h3 className="text-lg font-bold text-on-surface">{userName}</h3>
                <p className="text-on-surface-variant text-sm">Tier: Neural Oracle Pro</p>
                <button onClick={triggerAvatarUpload} className="mt-2 text-xs font-bold text-secondary uppercase tracking-widest hover:text-primary transition-colors">
                  Change Avatar
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">Display Name</label>
                  <input 
                    type="text" 
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-lg px-4 py-3 text-sm text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary/30 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">Email Address</label>
                  <div className="flex gap-4">
                    <input 
                      type="email" 
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-lg px-4 py-3 text-sm text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary/30 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* APPEARANCE SETTINGS */}
          <div className="bg-surface-container border border-outline-variant/20 rounded-2xl p-8">
            <h2 className="text-xl font-bold font-headline text-on-surface mb-6 flex items-center">
              <span className="material-symbols-outlined mr-3 text-secondary">palette</span>
              Appearance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">Theme</label>
                <select 
                  value={localTheme}
                  onChange={(e) => setLocalTheme(e.target.value)}
                  className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-lg px-4 py-3 text-sm font-bold text-on-surface focus:border-secondary outline-none transition-all cursor-pointer"
                >
                  <option value="dark">Synthesized Dark (Default)</option>
                  <option value="light">Luminous Light</option>
                  <option value="system">System Default</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">Chart Colors</label>
                <select 
                  value={localChartColors}
                  onChange={(e) => setLocalChartColors(e.target.value)}
                  className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-lg px-4 py-3 text-sm font-bold text-on-surface focus:border-secondary outline-none transition-all cursor-pointer"
                >
                  <option value="standard">Standard (Green/Red)</option>
                  <option value="colorblind">Colorblind Safe (Blue/Orange)</option>
                  <option value="neon">Neon Accent (Cyan/Pink)</option>
                </select>
              </div>
            </div>
          </div>

          {/* CHART & TRADING DEFAULTS */}
          <div className="bg-surface-container border border-outline-variant/20 rounded-2xl p-8">
            <h2 className="text-xl font-bold font-headline text-on-surface mb-6 flex items-center">
              <span className="material-symbols-outlined mr-3 text-secondary">candlestick_chart</span>
              Chart & Trading Defaults
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">Default Market</label>
                <select 
                  value={localDefaultMarket}
                  onChange={(e) => setLocalDefaultMarket(e.target.value)}
                  className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-lg px-4 py-3 text-sm font-bold text-on-surface focus:border-secondary outline-none transition-all cursor-pointer"
                >
                  <option value="nasdaq">NASDAQ / NYSE</option>
                  <option value="nse">NSE / BSE</option>
                  <option value="crypto">Global Crypto</option>
                  <option value="forex">Forex</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">Default Indicators</label>
                <div className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-lg p-3 flex flex-wrap gap-2">
                   {[
                     { id: 'rsi', label: 'RSI' },
                     { id: 'macd', label: 'MACD' },
                     { id: 'bb', label: 'Bollinger Bands' },
                     { id: 'ema', label: 'EMA (50, 200)' }
                   ].map(ind => (
                     <button
                       key={ind.id}
                       onClick={() => toggleIndicator(ind.id)}
                       className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors border ${
                         localDefaultIndicators.includes(ind.id) 
                           ? 'bg-secondary/20 border-secondary text-secondary' 
                           : 'bg-surface-container border-outline-variant/20 text-on-surface-variant hover:border-secondary/50'
                       }`}
                     >
                       {ind.label}
                     </button>
                   ))}
                </div>
              </div>
            </div>
          </div>

          {/* DEVELOPER / ADVANCED */}
          <div className="bg-surface-container border border-outline-variant/20 rounded-2xl p-8">
            <h2 className="text-xl font-bold font-headline text-on-surface mb-6 flex items-center">
              <span className="material-symbols-outlined mr-3 text-error">code</span>
              Developer / Advanced
            </h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">Custom OpenAI / LLM Key (Optional)</label>
                <div className="flex gap-4">
                  <input 
                    type="password" 
                    placeholder="sk-..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="flex-1 bg-surface-container-highest border border-outline-variant/20 rounded-lg px-4 py-3 text-sm text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary/30 outline-none transition-all"
                  />
                  <button className="bg-surface-container-highest border border-outline-variant/20 text-on-surface font-bold py-2.5 px-6 rounded-lg hover:border-secondary transition-all active:scale-95">
                    Connect
                  </button>
                </div>
                <p className="text-xs text-on-surface-variant mt-1">Leave blank to use Aura's default synthesized oracle.</p>
              </div>
              <hr className="border-outline-variant/10" />
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-sm text-on-surface">Two-Factor Authentication</h4>
                  <p className="text-xs text-on-surface-variant">Secure your trading operations.</p>
                </div>
                <button className="text-xs font-bold text-secondary uppercase tracking-widest border border-secondary px-4 py-2 rounded hover:bg-secondary/10 transition-colors">
                  Enable 2FA
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-8">
          
          {/* GENERAL PREFERENCES */}
          <div className="bg-surface-container border border-outline-variant/20 rounded-2xl p-8">
            <h2 className="text-xl font-bold font-headline text-on-surface mb-6 flex items-center">
              <span className="material-symbols-outlined mr-3 text-secondary">tune</span>
              Preferences
            </h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">Base Currency</label>
                <select 
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-lg px-4 py-3 text-sm font-bold text-on-surface focus:border-secondary outline-none transition-all cursor-pointer uppercase"
                >
                  {['USD', 'INR', 'EURO', 'POUND', 'Australian Dollar', 'Hong Kong Dollar'].map(c => (
                      <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">AI Intelligence Model</label>
                <div className="space-y-2">
                  <label className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${localAiModel === 'oracle-v3' ? 'border-secondary bg-secondary/5' : 'border-outline-variant/20 hover:border-secondary/50'}`}>
                    <input type="radio" name="aimodel" value="oracle-v3" checked={localAiModel === 'oracle-v3'} onChange={(e) => setLocalAiModel(e.target.value)} className="hidden"/>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-on-surface">Oracle-v3</span>
                        <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">Fast</span>
                      </div>
                    </div>
                  </label>
                  
                  <label className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${localAiModel === 'oracle-v4' ? 'border-secondary bg-secondary/5' : 'border-outline-variant/20 hover:border-secondary/50'}`}>
                    <input type="radio" name="aimodel" value="oracle-v4" checked={localAiModel === 'oracle-v4'} onChange={(e) => setLocalAiModel(e.target.value)} className="hidden"/>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-on-surface">Oracle-v4 <span className="text-secondary text-xs ml-1">★</span></span>
                        <span className="text-[10px] uppercase tracking-widest text-secondary">Neural</span>
                      </div>
                    </div>
                  </label>
                  
                  <label className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${localAiModel === 'quantum' ? 'border-primary bg-primary/5' : 'border-outline-variant/20 hover:border-secondary/50'}`}>
                    <input type="radio" name="aimodel" value="quantum" checked={localAiModel === 'quantum'} onChange={(e) => setLocalAiModel(e.target.value)} className="hidden"/>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-on-surface">Quantum-Beta</span>
                        <span className="text-[10px] uppercase tracking-widest text-primary">Exp</span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <hr className="border-outline-variant/10" />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-on-surface">Push Notifications</h4>
                  <p className="text-xs text-on-surface-variant">Alerts for high-signal trades.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={notificationsEnabled} onChange={(e) => setNotificationsEnabled(e.target.checked)}/>
                  <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                </label>
              </div>
            </div>
          </div>

          {/* VOICE ORACLE PREFERENCES */}
          <div className="bg-surface-container border border-outline-variant/20 rounded-2xl p-8">
            <h2 className="text-xl font-bold font-headline text-on-surface mb-6 flex items-center">
              <span className="material-symbols-outlined mr-3 text-secondary">record_voice_over</span>
              Voice Oracle
            </h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-on-surface">Voice Feedback</h4>
                  <p className="text-xs text-on-surface-variant">AI reads insights aloud.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={localVoiceFeedback} onChange={(e) => setLocalVoiceFeedback(e.target.checked)}/>
                  <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                </label>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">Voice Type & Speed</label>
                <select 
                  value={localVoiceType}
                  onChange={(e) => {
                    const val = e.target.value;
                    setLocalVoiceType(val);
                    if ('speechSynthesis' in window && localVoiceFeedback) {
                      const msg = new SpeechSynthesisUtterance("Voice intelligence updated.");
                      const voices = window.speechSynthesis.getVoices();
                      if (val === 'female-en-in') {
                        msg.voice = voices.find(v => (v.lang === 'en-IN' || v.lang === 'hi-IN') && (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('neerja') || v.name.toLowerCase().includes('veera') || v.name.toLowerCase().includes('google'))) || voices.find(v => v.lang.includes('IN')) || null;
                        msg.pitch = 1.2;
                        msg.rate = 1.0;
                      } else if (val === 'male-en-us') {
                        msg.voice = voices.find(v => v.lang === 'en-US' && v.name.toLowerCase().includes('male')) || voices.find(v => v.lang === 'en-US') || null;
                        msg.pitch = 0.9;
                        msg.rate = 1.2;
                      } else if (val === 'female-en-gb') {
                        msg.voice = voices.find(v => v.lang === 'en-GB' && v.name.toLowerCase().includes('female')) || voices.find(v => v.lang === 'en-GB') || null;
                        msg.pitch = 1.0;
                        msg.rate = 0.8;
                      }
                      window.speechSynthesis.cancel();
                      window.speechSynthesis.speak(msg);
                    }
                  }}
                  className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-lg px-4 py-3 text-sm font-bold text-on-surface focus:border-secondary outline-none transition-all cursor-pointer"
                  disabled={!localVoiceFeedback}
                >
                  <option value="female-en-in">Aura Neural (Female - Normal)</option>
                  <option value="male-en-us">Oracle v2 (Male - Fast)</option>
                  <option value="female-en-gb">British AI (Female - Slow)</option>
                </select>
              </div>
            </div>
          </div>

          {/* DATA PERFORMANCE */}
          <div className="bg-surface-container border border-outline-variant/20 rounded-2xl p-8">
            <h2 className="text-xl font-bold font-headline text-on-surface mb-6 flex items-center">
              <span className="material-symbols-outlined mr-3 text-secondary">speed</span>
              Data Performance
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">Data Refresh Rate</label>
                <select 
                  value={localRefreshRate}
                  onChange={(e) => setLocalRefreshRate(e.target.value)}
                  className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-lg px-4 py-3 text-sm font-bold text-on-surface focus:border-secondary outline-none transition-all cursor-pointer"
                >
                  <option value="realtime">Real-Time (WebSocket)</option>
                  <option value="10s">Every 10 Seconds</option>
                  <option value="1m">Every 1 Minute</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* DANGER ZONE */}
          <div className="bg-error/10 border border-error/30 rounded-2xl p-6">
             <h4 className="font-bold text-sm text-error mb-2 flex items-center">
                <span className="material-symbols-outlined mr-2">warning</span>
                Danger Zone
             </h4>
             <p className="text-xs text-error/80 mb-4">Permanently delete your account and clear all portfolio data.</p>
             <button onClick={handleDeleteAccount} className="w-full bg-error/20 text-error font-bold py-2 px-4 rounded hover:bg-error hover:text-white transition-colors text-sm">
               Delete Account
             </button>
          </div>
        </div>
      </div>

      {/* GLOBAL SAVE BUTTON */}
      <div className="flex justify-end mt-10">
        <button 
          onClick={handleGlobalSave}
          disabled={isSaving}
          className="bg-secondary text-surface-container-highest font-bold py-3 px-6 rounded-full shadow-[0_0_20px_rgba(0,227,253,0.3)] hover:shadow-[0_0_30px_rgba(0,227,253,0.5)] hover:scale-105 transition-all active:scale-95 flex items-center gap-2 text-base"
        >
          {isSaving ? (
            <><span className="material-symbols-outlined animate-spin">sync</span> Saving Changes...</>
          ) : (
            <><span className="material-symbols-outlined">save</span> Save All Changes</>
          )}
        </button>
      </div>

    </div>
  );
}
