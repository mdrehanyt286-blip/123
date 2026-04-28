
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, X, Key, Check, AlertCircle, Save } from 'lucide-react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('GEMINI_API_KEY') || '';
    setApiKey(savedKey);
  }, []);

  const handleSave = () => {
    localStorage.setItem('GEMINI_API_KEY', apiKey);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2rem] shadow-2xl z-[60] overflow-hidden"
          >
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-800 rounded-lg">
                  <Settings className="w-5 h-5 text-sky-400" />
                </div>
                <h2 className="text-xl font-black tracking-tighter">ARCADE SETTINGS</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-800 rounded-full transition-colors"
                id="close-settings"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  <Key className="w-4 h-4" /> AI Configuration
                </div>
                
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-300">Google AI Studio API Key</label>
                    <div className="relative">
                      <input 
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Paste your API key here..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-mono focus:border-sky-500/50 transition-colors outline-none pr-10"
                        id="api-key-input"
                      />
                      {apiKey && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Check className="w-4 h-4 text-green-500" />
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed italic">
                      Your key is saved locally in your browser and used only for AI features within this app.
                    </p>
                  </div>

                  <button 
                    onClick={handleSave}
                    disabled={isSaved}
                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                      isSaved 
                        ? 'bg-green-500 text-white' 
                        : 'bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/20 active:scale-95'
                    }`}
                    id="save-api-key"
                  >
                    {isSaved ? (
                      <>
                        <Check className="w-5 h-5" /> SAVED
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" /> SAVE API KEY
                      </>
                    )}
                  </button>
                </div>
              </section>

              <section className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-4">
                <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-amber-500 uppercase tracking-tighter">Privacy Note</h4>
                  <p className="text-[11px] text-amber-200/60 leading-tight">
                    API keys are sensitive. Never share this screen with others or record it. You can revoke your key anytime at AI Studio.
                  </p>
                </div>
              </section>
            </div>

            <div className="p-4 bg-slate-950/50 border-t border-slate-800 text-center">
              <span className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em]">Version 2.0.4 - Premium Arcade</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsPanel;
