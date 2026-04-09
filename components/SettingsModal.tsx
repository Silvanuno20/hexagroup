"use client";
import React from 'react';
import { X, Volume2, Trophy, Clock, Trash2, PartyPopper } from 'lucide-react';

interface SettingsModalProps {
  lang: 'pt' | 'en';
  settings: any;
  setSettings: React.Dispatch<React.SetStateAction<any>>;
  onClose: () => void;
}

const translations = {
  pt: {
    title: "Customizar",
    volume: "Volume do Som",
    spinTime: "Tempo de Rotação (segundos)",
    confetti: "Lançar Confetes ao vencer",
    popup: "Mostrar Janela do Vencedor",
    removeBtn: "Mostrar botão 'Remover' no resultado",
    msgLabel: "Mensagem de Vitória",
    close: "Fechar"
  },
  en: {
    title: "Customize",
    volume: "Sound Volume",
    spinTime: "Spin Time (seconds)",
    confetti: "Launch Confetti on win",
    popup: "Show Winner Popup",
    removeBtn: "Show 'Remove' button on result",
    msgLabel: "Victory Message",
    close: "Close"
  }
};

export default function SettingsModal({ lang, settings, setSettings, onClose }: SettingsModalProps) {
  const t = translations[lang];

  const update = (key: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1e1e1e] w-full max-w-lg rounded-[32px] border border-white/10 shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-[#252526]">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Settings className="text-blue-500" size={22} /> {t.title}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400"><X size={20} /></button>
        </div>

        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Volume */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-300">
              <Volume2 size={18} className="text-blue-500" /> {t.volume}: {settings.volume}%
            </label>
            <input 
              type="range" min="0" max="100" 
              value={settings.volume} 
              onChange={(e) => update('volume', parseInt(e.target.value))}
              className="w-full h-2 bg-black/40 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Tempo */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-300">
              <Clock size={18} className="text-blue-500" /> {t.spinTime}: {settings.spinTime}s
            </label>
            <input 
              type="range" min="1" max="30" 
              value={settings.spinTime} 
              onChange={(e) => update('spinTime', parseInt(e.target.value))}
              className="w-full h-2 bg-black/40 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <div className="h-px bg-white/5 my-2" />

          {/* Toggles */}
          <div className="space-y-4">
            <Toggle label={t.confetti} icon={<PartyPopper size={18}/>} active={settings.launchConfetti} onClick={() => update('launchConfetti', !settings.launchConfetti)} />
            <Toggle label={t.popup} icon={<Trophy size={18}/>} active={settings.showWinnerPopup} onClick={() => update('showWinnerPopup', !settings.showWinnerPopup)} />
            <Toggle label={t.removeBtn} icon={<Trash2 size={18}/>} active={settings.showRemoveButton} onClick={() => update('showRemoveButton', !settings.showRemoveButton)} />
          </div>
        </div>

        <div className="px-6 py-4 bg-[#181819] flex justify-end">
          <button onClick={onClose} className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-xl font-bold text-sm transition-all">{t.close}</button>
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, icon, active, onClick }: any) {
  return (
    <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
      <div className="flex items-center gap-3 text-sm font-medium">
        <span className="text-blue-500">{icon}</span> {label}
      </div>
      <button 
        onClick={onClick}
        className={`w-12 h-6 rounded-full transition-all relative ${active ? 'bg-blue-600' : 'bg-gray-700'}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${active ? 'right-1' : 'left-1'}`} />
      </button>
    </div>
  );
}

function Settings({ size, className }: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
}