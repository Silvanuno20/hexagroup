"use client";
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { 
  Settings, Plus, Trash2, Trophy, 
  FilePlus, FolderOpen, Save, Share2, BarChart3,
  Maximize2, Minimize2 
} from 'lucide-react';
import confetti from 'canvas-confetti';

import SettingsModal from '@/components/SettingsModal';
import WheelCanvas from '@/components/Wheelcanvas';
import SaveModal from '@/components/SaveModal';
import OpenModal from '@/components/OpenModal';
import ShareModal from '@/components/ShareModal';
import StatsPanel from '@/components/StatsPanel';
import { useWheelPersistence } from '@/hooks/useWheelPersistence';

// 1. Definição das traduções (Corrige o erro "Cannot find name translations")
const translations = {
  pt: {
    new: "Novo", open: "Abrir", save: "Salvar", share: "Partilhar",
    entries: "Entradas", results: "Resultados", chances: "Chances",
    placeholder: "Nome", winnerMsg: "Temos um vencedor!", continue: "Continuar"
  },
  en: {
    new: "New", open: "Open", save: "Save", share: "Share",
    entries: "Entries", results: "Results", chances: "Chances",
    placeholder: "Name", winnerMsg: "We have a winner!", continue: "Continue"
  }
};

export default function WheelPage() {
  // Hook personalizado (Verifique se o arquivo existe em @/hooks/useWheelPersistence)
  const { rawText, setRawText, results, setResults, parsedEntries } = useWheelPersistence();
  
  const [lang, setLang] = useState<'pt' | 'en'>('pt');
  const t = translations[lang];

  // Estados de Fullscreen e Vencedor
  const wheelContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenWinner, setFullscreenWinner] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'entries' | 'results'>('entries');
  const [modals, setModals] = useState({ 
    settings: false, save: false, open: false, share: false, stats: false 
  });
  const [winner, setWinner] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  // Estado de configurações
  const [appSettings, setAppSettings] = useState({
    volume: 50,
    launchConfetti: true,
    winnerMessage: t.winnerMsg,
    showWinnerPopup: true,
    showRemoveButton: true,
    spinTime: 10,
    maxNames: 1000
  });

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      wheelContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      const isFs = !!document.fullscreenElement;
      setIsFullscreen(isFs);
      if (!isFs) setFullscreenWinner(null);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Tipagem para reduzir erro de 'any' no reduce
  const totalQuantidade = parsedEntries.reduce((acc: number, curr: { quantidade: number }) => acc + curr.quantidade, 0);

  const addItem = () => {
    const nameInput = document.getElementById('new-name-input') as HTMLInputElement;
    const qtyInput = document.getElementById('new-qty-input') as HTMLInputElement;
    if (nameInput?.value.trim()) {
      const newEntry = `${nameInput.value.trim()}, ${qtyInput.value || 1}`;
      setRawText((prev: string) => prev ? `${prev}\n${newEntry}` : newEntry);
      nameInput.value = '';
      qtyInput.value = '1';
      nameInput.focus();
    }
  };

  const handleNew = () => {
    if (window.confirm(lang === 'pt' ? 'Limpar tudo?' : 'Clear all?')) {
      setRawText("");
      setResults([]);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] flex flex-col font-sans overflow-hidden">
      
      <header className="h-20 bg-[#000000] border-b border-white/5 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 relative flex items-center justify-center">
            <Image src="/images/kzz.gif" alt="Logo" fill className="object-contain" unoptimized />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-white uppercase leading-none">Builders</h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">World</p>
          </div>
          <div className="h-8 w-px bg-white/10 mx-6 hidden md:block" />
          <nav className="hidden md:flex items-center gap-1">
            <MenuButton onClick={handleNew} icon={<FilePlus size={18}/>} label={t.new} />
            <MenuButton onClick={() => setModals({...modals, stats: true})} icon={<BarChart3 size={18}/>} label={t.chances} />
            <MenuButton onClick={() => setModals({...modals, open: true})} icon={<FolderOpen size={18}/>} label={t.open} />
            <MenuButton onClick={() => setModals({...modals, save: true})} icon={<Save size={18}/>} label={t.save} />
            <MenuButton onClick={() => setModals({...modals, share: true})} icon={<Share2 size={18}/>} label={t.share} />
          </nav>
        </div>
        <button onClick={() => setModals({...modals, settings: true})} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 border border-white/5 transition-all">
          <Settings size={20}/>
        </button>
      </header>

      <main className="flex-1 p-6 md:p-10 flex flex-col md:flex-row gap-8 overflow-hidden bg-[radial-gradient(circle_at_top,_#111_0%,_#050505_100%)]">
        
        <div 
          ref={wheelContainerRef}
          className={`flex-1 bg-[#0f0f0f] rounded-[48px] border border-white/5 flex items-center justify-center relative shadow-2xl overflow-hidden group transition-all ${isFullscreen ? 'rounded-none border-none bg-black' : ''}`}
        >
          {/* Botão Tela Cheia */}
          <button 
            onClick={toggleFullscreen}
            className="absolute top-8 right-10 p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-500 hover:text-white transition-all border border-white/5 z-50 shadow-xl backdrop-blur-md"
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>

          {/* Vencedor em Tela Cheia */}
          {isFullscreen && fullscreenWinner && (
            <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-500 text-center">
              <Trophy size={48} className="text-blue-500 mb-4" />
              <h3 className="text-blue-500 font-black uppercase text-xs tracking-[8px] mb-4">{t.winnerMsg}</h3>
              <div className="text-7xl font-black text-white mb-10">{fullscreenWinner}</div>
              <button onClick={() => setFullscreenWinner(null)} className="px-10 py-5 bg-white text-black font-black rounded-2xl uppercase tracking-[2px] hover:bg-gray-200 transition-all">
                {t.continue}
              </button>
            </div>
          )}

          {!isFullscreen && (
            <div className="absolute top-8 left-10 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              <span className="text-[10px] font-black uppercase tracking-[4px] text-gray-600">The Builders Space</span>
            </div>
          )}
          
          <WheelCanvas 
            entries={parsedEntries} 
            settings={appSettings} 
            setIsSpinning={setIsSpinning} 
            onWinner={(n) => {
              setResults((prev: string[]) => [n, ...prev]);
              if (isFullscreen) {
                setFullscreenWinner(n);
              } else {
                setWinner(n);
              }
              if (appSettings.launchConfetti) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            }} 
          />
        </div>

        {!isFullscreen && (
          <div className="w-full md:w-[420px] flex flex-col gap-6">
            <div className="bg-[#0f0f0f] rounded-[48px] border border-white/5 flex flex-col flex-1 shadow-2xl overflow-hidden">
              <div className="flex p-2 bg-black/40 border-b border-white/5">
                <TabButton active={activeTab === 'entries'} onClick={() => setActiveTab('entries')} label={`${t.entries} (${totalQuantidade})`} />
                <TabButton active={activeTab === 'results'} onClick={() => setActiveTab('results')} label={`${t.results} (${results.length})`} />
              </div>

              <div className="flex-1 p-8 flex flex-col overflow-hidden">
                {activeTab === 'entries' ? (
                  <div className="flex flex-col h-full gap-6">
                    <div className="flex gap-2">
                      <input id="new-name-input" type="text" placeholder={t.placeholder} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500/50" onKeyDown={(e) => e.key === 'Enter' && addItem()} />
                      <input id="new-qty-input" type="number" defaultValue="1" min="1" className="w-20 bg-white/5 border border-white/10 rounded-xl px-2 py-3 text-sm text-center outline-none" onKeyDown={(e) => e.key === 'Enter' && addItem()} />
                      <button onClick={addItem} className="p-3 bg-blue-500 rounded-xl text-white hover:bg-blue-600 transition-all"><Plus size={20}/></button>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                      {parsedEntries.map((item: {nome: string, quantidade: number}, index: number) => (
                        <div key={index} className="flex items-center gap-3 bg-white/[0.03] p-3 rounded-2xl border border-white/5 group transition-all">
                          <input type="text" value={item.nome} onChange={(e) => {
                            const newEntries = [...parsedEntries];
                            newEntries[index].nome = e.target.value;
                            setRawText(newEntries.map(ie => `${ie.nome}, ${ie.quantidade}`).join('\n'));
                          }} className="flex-1 bg-transparent text-sm font-bold outline-none text-gray-300 focus:text-white" />
                          <input type="number" value={item.quantidade} min="1" onChange={(e) => {
                            const newEntries = [...parsedEntries];
                            newEntries[index].quantidade = parseInt(e.target.value) || 1;
                            setRawText(newEntries.map(ie => `${ie.nome}, ${ie.quantidade}`).join('\n'));
                          }} className="w-12 bg-white/5 rounded-lg text-xs text-center outline-none" />
                          <button onClick={() => {
                            const newEntries = parsedEntries.filter((_, i) => i !== index);
                            setRawText(newEntries.map(ie => `${ie.nome}, ${ie.quantidade}`).join('\n'));
                          }} className="text-gray-700 hover:text-red-500 transition-all"><Trash2 size={16}/></button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                    {results.map((res: string, i: number) => (
                      <div key={i} className="flex justify-between items-center bg-white/[0.02] p-5 rounded-[24px] border border-white/5 group transition-all">
                        <span className="font-bold text-sm">{res}</span>
                        <button onClick={() => setResults(results.filter((_, idx) => idx !== i))} className="text-gray-700 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {modals.stats && <StatsPanel entries={parsedEntries} onClose={() => setModals({...modals, stats: false})} />}
      {modals.settings && <SettingsModal lang={lang} settings={appSettings} setSettings={setAppSettings} onClose={() => setModals({...modals, settings: false})} />}
      {modals.save && <SaveModal lang={lang} onClose={() => setModals({...modals, save: false})} entries={rawText.split('\n')} />}
      {modals.open && <OpenModal lang={lang} onClose={() => setModals({...modals, open: false})} onLoadData={(data) => setRawText(data)} />}
      {modals.share && <ShareModal lang={lang} onClose={() => setModals({...modals, share: false})} />}

      {winner && !isSpinning && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="bg-[#0f0f0f] border border-white/10 p-12 rounded-[56px] text-center max-w-sm w-full relative">
            <Trophy size={40} className="mx-auto mb-8 text-blue-500" />
            <h3 className="text-blue-500 font-black uppercase text-[10px] tracking-[5px] mb-3">{t.winnerMsg}</h3>
            <div className="text-5xl font-black text-white mb-12 tracking-tighter">{winner}</div>
            <button onClick={() => setWinner(null)} className="w-full py-6 bg-white text-black font-black rounded-[24px] uppercase tracking-[2px]">
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
    <button onClick={onClick} className="flex items-center gap-2.5 px-4 py-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all text-xs font-bold group">
      <span className="text-blue-500 group-hover:scale-110 transition-transform">{icon}</span>
      {label}
    </button>
  );
}

function TabButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button onClick={onClick} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-[32px] transition-all ${active ? 'bg-[#1a1a1a] text-blue-500 shadow-inner' : 'text-gray-600'}`}>
      {label}
    </button>
  );
}