"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Settings, Plus, Trash2, Globe, Trophy, 
  FilePlus, FolderOpen, Save, Share2 
} from 'lucide-react';
import confetti from 'canvas-confetti';

import SettingsModal from '@/components/SettingsModal';
import WheelCanvas from '@/components/Wheelcanvas';
import SaveModal from '@/components/SaveModal';
import OpenModal from '@/components/OpenModal';
import ShareModal from '@/components/ShareModal';
import { useWheelPersistence } from '@/hooks/useWheelPersistence';

const translations = {
  pt: {
    new: "Novo", open: "Abrir", save: "Salvar", share: "Partilhar",
    entries: "Entradas", results: "Resultados",
    placeholder: "Insira os nomes...", winnerMsg: "Temos um vencedor!",
    continue: "Continuar"
  },
  en: {
    new: "New", open: "Open", save: "Save", share: "Share",
    entries: "Entries", results: "Results",
    placeholder: "Enter names...", winnerMsg: "We have a winner!",
    continue: "Continue"
  }
};

export default function WheelPage() {
  const { rawText, setRawText, results, setResults } = useWheelPersistence();
  const [lang, setLang] = useState<'pt' | 'en'>('pt');
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState<'entries' | 'results'>('entries');
  const [modals, setModals] = useState({ settings: false, save: false, open: false, share: false });
  const [winner, setWinner] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const [settings, setSettings] = useState({
    volume: 50,
    launchConfetti: true,
    winnerMessage: t.winnerMsg,
    showWinnerPopup: true,
    showRemoveButton: true,
    spinTime: 10,
    maxNames: 1000
  });

  const entries = rawText.split('\n').filter(l => l.trim() !== "");

  const handleNew = () => {
    if (window.confirm(lang === 'pt' ? 'Limpar tudo?' : 'Clear all?')) {
      setRawText("");
      setResults([]);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] flex flex-col font-sans overflow-hidden">
      
      {/* HEADER BUILDERS COM GIF E BANDEIRAS */}
      <header className="h-20 bg-[#000000] border-b border-white/5 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-4">
          
          {/* GIF ANIMADO */}
          <div className="w-14 h-14 relative flex items-center justify-center -ml-2">
            <Image 
              src="/images/kzz.gif" 
              alt="Builders Team Animation"
              fill
              className="object-contain"
              unoptimized 
            />
          </div>

          <div>
            <h1 className="text-sm font-black tracking-tight leading-none text-white uppercase">Builders</h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">World</p>
          </div>
          
          <div className="h-8 w-px bg-white/10 mx-6 hidden md:block" />
          
          <nav className="hidden md:flex items-center gap-1">
            <MenuButton onClick={handleNew} icon={<FilePlus size={18}/>} label={t.new} />
            <MenuButton onClick={() => setModals({...modals, open: true})} icon={<FolderOpen size={18}/>} label={t.open} />
            <MenuButton onClick={() => setModals({...modals, save: true})} icon={<Save size={18}/>} label={t.save} />
            <MenuButton onClick={() => setModals({...modals, share: true})} icon={<Share2 size={18}/>} label={t.share} />
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* SWITCHER DE IDIOMA */}
          <div className="bg-[#1a1a1a] rounded-xl p-1 flex mr-2 border border-white/5 shadow-inner gap-1">
            <button 
              onClick={() => setLang('pt')} 
              className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all flex items-center gap-2 ${
                lang === 'pt' ? 'bg-[#333] text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <div className="w-4 h-3 relative">
                <Image src="/images/portuguese.png" alt="PT" fill className="object-cover rounded-sm" />
              </div>
              PT
            </button>
            <button 
              onClick={() => setLang('en')} 
              className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all flex items-center gap-2 ${
                lang === 'en' ? 'bg-[#333] text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <div className="w-4 h-3 relative">
                <Image src="/images/united-kingdom.png" alt="EN" fill className="object-cover rounded-sm" />
              </div>
              EN
            </button>
          </div>
          
          <button onClick={() => setModals({...modals, settings: true})} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 transition-all border border-white/5">
            <Settings size={20}/>
          </button>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 p-6 md:p-10 flex flex-col md:flex-row gap-8 overflow-hidden bg-[radial-gradient(circle_at_top,_#111_0%,_#050505_100%)]">
        
        {/* ÁREA DA RODA ÚNICA */}
        <div className="flex-1 bg-[#0f0f0f] rounded-[48px] border border-white/5 flex items-center justify-center relative shadow-2xl overflow-hidden group">
          <div className="absolute top-8 left-10 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
            <span className="text-[10px] font-black uppercase tracking-[4px] text-gray-600">The Builders Space</span>
          </div>
          
          <WheelCanvas 
            entries={entries} 
            settings={settings} 
            setIsSpinning={setIsSpinning} 
            onWinner={(n) => {
              setWinner(n);
              setResults(prev => [n, ...prev]);
              if (settings.launchConfetti) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            }} 
          />
        </div>

        {/* PAINEL LATERAL */}
        <div className="w-full md:w-[420px] flex flex-col gap-6">
          <div className="bg-[#0f0f0f] rounded-[48px] border border-white/5 flex flex-col flex-1 shadow-2xl overflow-hidden">
            
            <div className="flex p-2 bg-black/40 border-b border-white/5">
              <TabButton active={activeTab === 'entries'} onClick={() => setActiveTab('entries')} label={`${t.entries} (${entries.length})`} />
              <TabButton active={activeTab === 'results'} onClick={() => setActiveTab('results')} label={`${t.results} (${results.length})`} />
            </div>

            <div className="flex-1 p-8 flex flex-col overflow-hidden">
              {activeTab === 'entries' ? (
                <textarea 
                  className="flex-1 bg-transparent border-none text-gray-300 text-sm leading-relaxed outline-none resize-none custom-scrollbar placeholder:text-gray-800"
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder={t.placeholder}
                />
              ) : (
                <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
                  {results.map((res, i) => (
                    <div key={i} className="flex justify-between items-center bg-white/[0.02] p-5 rounded-[24px] border border-white/5 group hover:bg-white/[0.04] transition-all">
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-bold text-gray-700">#{results.length - i}</span>
                        <span className="font-bold text-sm tracking-tight">{res}</span>
                      </div>
                      <button onClick={() => setResults(results.filter((_, idx) => idx !== i))} className="text-gray-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1.5 hover:bg-red-500/10 rounded-lg">
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* MODAIS E POPUP DE VENCEDOR */}
      {modals.settings && <SettingsModal lang={lang} settings={settings} setSettings={setSettings} onClose={() => setModals({...modals, settings: false})} />}
      {modals.save && <SaveModal lang={lang} onClose={() => setModals({...modals, save: false})} entries={entries} />}
      {modals.open && <OpenModal lang={lang} onClose={() => setModals({...modals, open: false})} onLoadData={(data) => setRawText(data)} />}
      {modals.share && <ShareModal lang={lang} onClose={() => setModals({...modals, share: false})} />}

      {winner && !isSpinning && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/95 backdrop-blur-xl px-4 animate-in fade-in duration-500">
          <div className="bg-[#0f0f0f] border border-white/10 p-12 rounded-[56px] text-center max-w-sm w-full shadow-[0_0_100px_rgba(59,130,246,0.1)] relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
            <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-8 text-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.2)]">
               <Trophy size={40} />
            </div>
            <h3 className="text-blue-500 font-black uppercase text-[10px] tracking-[5px] mb-3">{t.winnerMsg}</h3>
            <div className="text-5xl font-black text-white mb-12 tracking-tighter">{winner}</div>
            <button onClick={() => setWinner(null)} className="w-full py-6 bg-white text-black font-black rounded-[24px] text-[11px] uppercase tracking-[2px] hover:bg-gray-200 transition-all shadow-2xl active:scale-95 shadow-white/5">
              {t.continue}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuButton({ onClick, icon, label }: { onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2.5 px-4 py-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all text-xs font-bold tracking-wide group">
      <span className="text-blue-500 group-hover:scale-110 transition-transform">{icon}</span>
      {label}
    </button>
  );
}

function TabButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button 
      onClick={onClick} 
      className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-[32px] transition-all ${active ? 'bg-[#1a1a1a] text-blue-500 shadow-inner' : 'text-gray-600 hover:text-gray-400'}`}
    >
      {label}
    </button>
  );
}