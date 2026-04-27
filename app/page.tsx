"use client";
import React, { useState, useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import {
  Settings, Plus, Trash2, Trophy,
  FilePlus, FolderOpen, Save, BarChart3,
  Maximize2, Minimize2
} from 'lucide-react';
import confetti from 'canvas-confetti';

import SettingsModal from '@/components/SettingsModal';
import WheelCanvas from '@/components/Wheelcanvas'; 
import SaveModal from '@/components/SaveModal';
import OpenModal from '@/components/OpenModal';
import StatsPanel from '@/components/StatsPanel';
import { useWheelPersistence } from '@/hooks/useWheelPersistence';
import { supabase } from '@/hooks/supabaseClient';

const translations = {
  pt: {
    new: "Novo", open: "Abrir", save: "Salvar", share: "Partilhar",
    entries: "Entradas", results: "Resultados", chances: "Chances",
    placeholder: "Nome", winnerMsg: "Temos um vencedor!", continue: "Continuar",
    saveName: "Nome da roda", stock: "Stock", prob: "Prob %", outOfStock: "Sem stock",
    addEntry: "Add",
  },
  en: {
    new: "New", open: "Open", save: "Save", share: "Share",
    entries: "Entries", results: "Results", chances: "Chances",
    placeholder: "Name", winnerMsg: "We have a winner!", continue: "Continue",
    saveName: "Wheel name", stock: "Stock", prob: "Prob %", outOfStock: "Out of stock",
    addEntry: "Add",
  },
};

export default function WheelPage() {
  const {
    rawText, setRawText,
    results, setResults,
    saveToSupabase,
    loadFromSupabase,
    listWheels,
    addResult,
  } = useWheelPersistence();

  const [lang, setLang] = useState<'pt' | 'en'>('pt');
  const t = translations[lang];

  const wheelContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenWinner, setFullscreenWinner] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'entries' | 'results'>('entries');
  const [modals, setModals] = useState({
    settings: false, save: false, open: false, share: false, stats: false,
  });
  const [winner, setWinner] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'online' | 'offline'>('offline');

  const [appSettings, setAppSettings] = useState({
    volume: 50,
    launchConfetti: true,
    winnerMessage: translations.pt.winnerMsg,
    showWinnerPopup: true,
    showRemoveButton: true,
    spinTime: 10,
    maxNames: 1000,
    probMode: 'automatic', 
  });

  const parsedEntries = useMemo(() => {
    return rawText.split('\n')
      .filter(line => line.trim() !== '')
      .map(line => {
        const parts = line.split(',').map(s => s.trim());
        return {
          nome: parts[0] || "", 
          quantidade: parseInt(parts[1]) || 0,
          probabilidade: parseInt(parts[2]) || 1
        };
      });
  }, [rawText]);

  useEffect(() => {
    const channel = supabase.channel('status').subscribe((status) => {
      setSyncStatus(status === 'SUBSCRIBED' ? 'online' : 'offline');
    });
    return () => { supabase.removeChannel(channel); };
  }, []);

  const toggleFullscreen = () => {
    if (!wheelContainerRef.current) return;
    if (!document.fullscreenElement) {
      wheelContainerRef.current.requestFullscreen();
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

  const totalStock = parsedEntries.reduce((acc, curr) => acc + curr.quantidade, 0);

  const addItem = () => {
    const nameInput = document.getElementById('new-name-input') as HTMLInputElement;
    const qtyInput = document.getElementById('new-qty-input') as HTMLInputElement;
    const probInput = document.getElementById('new-prob-input') as HTMLInputElement;
    
    if (nameInput?.value.trim()) {
      const nome = nameInput.value.trim();
      const stock = qtyInput.value || "1";
      
      // Trava de 100% na adição
      let probVal = parseInt(probInput?.value || "10");
      if (probVal > 100) probVal = 100;

      const newEntry = `${nome}, ${stock}, ${probVal}`;
      setRawText((prev: string) => (prev ? `${newEntry}\n${prev}` : newEntry));
      
      nameInput.value = '';
      qtyInput.value = '1';
      if (probInput) probInput.value = '10';
      nameInput.focus();
    }
  };

  const handleStockDecrease = (nome: string) => {
    const updated = parsedEntries.map((entry) => {
      if (entry.nome === nome) {
        return { ...entry, quantidade: Math.max(0, entry.quantidade - 1) };
      }
      return entry;
    });
    setRawText(updated.map(e => `${e.nome}, ${e.quantidade}, ${e.probabilidade}`).join('\n'));
  };

  const handleSaveWheel = async (wheelName: string) => {
    try {
      await saveToSupabase(wheelName);
    } catch (error) {
      console.error("Erro ao salvar roda");
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
            <h1 className="text-sm font-black tracking-tight text-white uppercase leading-none flex items-center gap-2">
              Builders
              <div className={`w-1.5 h-1.5 rounded-full ${syncStatus === 'online' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500'}`} />
            </h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">World</p>
          </div>
          <nav className="hidden md:flex items-center gap-1 ml-6">
            <MenuButton onClick={() => setRawText('')} icon={<FilePlus size={18} />} label={t.new} />
            <MenuButton onClick={() => setModals({ ...modals, stats: true })} icon={<BarChart3 size={18} />} label={t.chances} />
            <MenuButton onClick={() => setModals({ ...modals, open: true })} icon={<FolderOpen size={18} />} label={t.open} />
            <MenuButton onClick={() => setModals({ ...modals, save: true })} icon={<Save size={18} />} label={t.save} />
          </nav>
        </div>
        <button onClick={() => setModals({ ...modals, settings: true })} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5"><Settings size={20} /></button>
      </header>

      <main className="flex-1 p-6 md:p-10 flex flex-col md:flex-row gap-8 overflow-hidden bg-[radial-gradient(circle_at_top,_#111_0%,_#050505_100%)]">
        <div className="flex-1 flex items-center justify-center">
          <div ref={wheelContainerRef} className={`bg-[#0f0f0f] rounded-[48px] border border-white/5 flex items-center justify-center relative w-full h-full shadow-2xl transition-all ${isFullscreen ? 'rounded-none border-none bg-black' : ''}`}>
            <button onClick={toggleFullscreen} className="absolute top-8 right-10 p-3 bg-white/5 hover:bg-white/10 rounded-2xl z-50 backdrop-blur-md transition-all border border-white/5">
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>

            {isFullscreen && fullscreenWinner && (
              <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-500 text-center">
                <Trophy size={48} className="text-blue-500 mb-4" />
                <div className="text-7xl font-black text-white mb-10 tracking-tighter">{fullscreenWinner}</div>
                <button onClick={() => setFullscreenWinner(null)} className="px-10 py-5 bg-white text-black font-black rounded-2xl uppercase tracking-[2px] hover:bg-gray-200 transition-all">{t.continue}</button>
              </div>
            )}

            <WheelCanvas
              entries={parsedEntries}
              settings={appSettings}
              setIsSpinning={setIsSpinning}
              onStockDecrease={handleStockDecrease}
              onWinner={async (nome) => {
                await addResult(nome);
                if (isFullscreen) {
                  setFullscreenWinner(nome);
                } else {
                  setWinner(nome);
                }

                if (appSettings.launchConfetti) {
                  confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.5 },
                    zIndex: 9999,
                  });
                }
              }}
            />
          </div>
        </div>

        {!isFullscreen && (
          <div className="w-full md:w-[420px] flex flex-col gap-6 h-full max-h-[calc(100vh-10rem)]">
            <div className="bg-[#0f0f0f] rounded-[48px] border border-white/5 flex flex-col flex-1 shadow-2xl overflow-hidden">
              <div className="flex p-2 bg-black/40 border-b border-white/5 flex-shrink-0">
                <TabButton active={activeTab === 'entries'} onClick={() => setActiveTab('entries')} label={`${t.entries} (${totalStock})`} />
                <TabButton active={activeTab === 'results'} onClick={() => setActiveTab('results')} label={`${t.results} (${results.length})`} />
              </div>

              <div className="flex-1 p-8 flex flex-col overflow-hidden">
                {activeTab === 'entries' ? (
                  <div className="flex flex-col h-full gap-4 overflow-hidden">
                    {/* Cabeçalhos Alinhados */}
                    <div className="grid grid-cols-12 gap-2 px-1">
                      <label className={`${appSettings.probMode === 'manual' ? 'col-span-6' : 'col-span-8'} text-[10px] uppercase font-black text-gray-500 tracking-widest ml-2`}>
                        {t.placeholder}
                      </label>
                      <label className="col-span-2 text-[10px] uppercase font-black text-gray-500 tracking-widest text-center">
                        {t.stock}
                      </label>
                      {appSettings.probMode === 'manual' && (
                        <label className="col-span-2 text-[10px] uppercase font-black text-gray-500 tracking-widest text-center text-blue-500/70">
                          {t.prob}
                        </label>
                      )}
                    </div>

                    <div className="grid grid-cols-12 gap-2 flex-shrink-0">
                      <input id="new-name-input" type="text" placeholder={t.placeholder} className={`${appSettings.probMode === 'manual' ? 'col-span-6' : 'col-span-8'} bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500/50 outline-none transition-all`} />
                      <input id="new-qty-input" type="number" defaultValue="1" className="col-span-2 bg-white/5 border border-white/10 rounded-xl px-2 py-3 text-sm text-center outline-none" />
                      {appSettings.probMode === 'manual' && (
                        <input id="new-prob-input" type="number" min="1" max="100" defaultValue="10" className="col-span-2 bg-white/5 border border-white/10 rounded-xl px-2 py-3 text-sm text-center outline-none focus:border-blue-500/50" />
                      )}
                      <button onClick={addItem} className="col-span-2 bg-blue-500 rounded-xl text-white flex items-center justify-center hover:bg-blue-600 transition-all"><Plus size={20} /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar">
                      {parsedEntries.map((item, index) => (
                        <div key={index} className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${item.quantidade === 0 ? 'bg-red-500/5 border-red-500/20 opacity-50' : 'bg-white/[0.03] border-white/5'}`}>
                          <input 
                            type="text" 
                            value={item.nome} 
                            onChange={(e) => {
                               const updated = [...parsedEntries];
                               updated[index].nome = e.target.value;
                               setRawText(updated.map(ie => `${ie.nome}, ${ie.quantidade}, ${ie.probabilidade}`).join('\n'));
                            }}
                            className="flex-1 bg-transparent text-sm font-bold outline-none text-gray-300 focus:text-white" 
                          />
                          
                          <input 
                            type="number" 
                            value={item.quantidade === 0 ? "" : item.quantidade} 
                            placeholder="0"
                            className="w-12 bg-white/5 rounded-lg text-xs text-center border border-white/10 outline-none focus:border-blue-500/50"
                            onChange={(e) => {
                               const val = e.target.value;
                               const updated = [...parsedEntries];
                               updated[index].quantidade = val === "" ? 0 : parseInt(val);
                               setRawText(updated.map(ie => `${ie.nome}, ${ie.quantidade}, ${ie.probabilidade}`).join('\n'));
                            }}
                          />

                          {appSettings.probMode === 'manual' && (
                            <input 
                              type="number" 
                              min="1"
                              max="100"
                              value={item.probabilidade} 
                              className="w-12 bg-blue-500/10 rounded-lg text-xs text-center border border-blue-500/20 text-blue-400 outline-none focus:ring-1 focus:ring-blue-500/50"
                              onChange={(e) => {
                                 const updated = [...parsedEntries];
                                 let val = parseInt(e.target.value) || 0;
                                 if (val > 100) val = 100; // Trava de 100% na edição
                                 updated[index].probabilidade = val;
                                 setRawText(updated.map(ie => `${ie.nome}, ${ie.quantidade}, ${ie.probabilidade}`).join('\n'));
                              }}
                            />
                          )}
                          <button 
                            onClick={() => {
                              const updated = parsedEntries.filter((_, i) => i !== index);
                              setRawText(updated.map(ie => `${ie.nome}, ${ie.quantidade}, ${ie.probabilidade}`).join('\n'));
                            }}
                            className="text-red-500/50 hover:text-red-500 transition-all flex-shrink-0"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
                    {results.slice().reverse().map((res, i) => (
                      <div key={i} className="flex justify-between items-center p-5 rounded-[24px] border border-white/5 bg-white/[0.02]">
                        <span className="font-bold text-sm text-gray-400">{res}</span>
                        <button onClick={() => setResults(results.filter((_, idx) => idx !== (results.length - 1 - i)))} className="text-red-500/50 hover:text-red-500"><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {modals.stats && <StatsPanel entries={parsedEntries} onClose={() => setModals({ ...modals, stats: false })} />}
      {modals.settings && <SettingsModal lang={lang} settings={appSettings} setSettings={setAppSettings} onClose={() => setModals({ ...modals, settings: false })} />}
      
      {modals.save && (
        <SaveModal 
          lang={lang} 
          onClose={() => setModals({ ...modals, save: false })} 
          entries={rawText.split('\n')} 
          onSave={handleSaveWheel} 
        />
      )}
      
      {modals.open && (
        <OpenModal 
          lang={lang} 
          onClose={() => setModals({ ...modals, open: false })} 
          setRawText={setRawText} 
          listWheels={listWheels} 
          onLoadWheel={loadFromSupabase} 
        />
      )}

      {winner && !isSpinning && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/95 backdrop-blur-xl">
          <div className="bg-[#0f0f0f] border border-white/10 p-12 rounded-[56px] text-center max-w-sm w-full shadow-2xl">
            <Trophy size={40} className="mx-auto mb-8 text-blue-500" />
            <div className="text-5xl font-black text-white mb-12 tracking-tighter">{winner}</div>
            <button onClick={() => setWinner(null)} className="w-full py-6 bg-white text-black font-black rounded-[24px] uppercase tracking-[2px] hover:bg-gray-200 transition-all">{t.continue}</button>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuButton({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2.5 px-4 py-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all text-xs font-bold group">
      <span className="text-blue-500 group-hover:scale-110 transition-transform">{icon}</span>
      {label}
    </button>
  );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-[32px] transition-all ${active ? 'bg-[#1a1a1a] text-blue-500 shadow-inner' : 'text-gray-600'}`}>
      {label}
    </button>
  );
}