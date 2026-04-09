"use client";
import React, { useState, useEffect } from 'react';
import { 
  Settings, Shuffle, SortAsc, Plus, Trash2, 
  FilePlus, FolderOpen, Save, Share2, 
  Maximize, Globe, ChevronDown, X 
} from 'lucide-react';
import confetti from 'canvas-confetti';

import SettingsModal from '@/components/SettingsModal';
import WheelCanvas from '@/components/Wheelcanvas';
import OpenModal from '@/components/OpenModal';
import SaveModal from '@/components/SaveModal';
import ShareModal from '@/components/ShareModal';
import { useWheelPersistence } from '@/hooks/useWheelPersistence';

const translations = {
  pt: {
    customize: "Customizar", new: "Novo", open: "Abrir", save: "Salvar",
    share: "Compartilhar", entries: "Entradas", results: "Resultados",
    shuffle: "Baralhar", sort: "Ordenar", addWheel: "Adicionar roda",
    placeholder: "Insira os nomes aqui...", noWinner: "Nenhum vencedor ainda...",
    langName: "Português", confirmNew: "Limpar tudo?", winnerMsg: "Temos um vencedor!",
    maxWheels: "Máximo de 4 rodas atingido."
  },
  en: {
    customize: "Customize", new: "New", open: "Open", save: "Save",
    share: "Share", entries: "Entries", results: "Results",
    shuffle: "Shuffle", sort: "Sort", addWheel: "Add wheel",
    placeholder: "Enter names here...", noWinner: "No winner yet...",
    langName: "English", confirmNew: "Clear all?", winnerMsg: "We have a winner!",
    maxWheels: "Maximum of 4 wheels reached."
  }
};

export default function WheelPage() {
  const { rawText, setRawText, results, setResults } = useWheelPersistence();
  const [lang, setLang] = useState<'pt' | 'en'>('pt');
  const t = translations[lang];

  const [wheels, setWheels] = useState<number[]>([1]);
  const [activeTab, setActiveTab] = useState<'entries' | 'results'>('entries');
  const [modals, setModals] = useState({ settings: false, open: false, save: false, share: false });
  const [winner, setWinner] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const [settings, setSettings] = useState({
    volume: 50,
    launchConfetti: true,
    winnerMessage: t.winnerMsg,
    showWinnerPopup: true,
    showRemoveButton: true,
    spinTime: 10,
    sound: 'Som de tique-taque'
  });

  useEffect(() => {
    setSettings(prev => ({ ...prev, winnerMessage: t.winnerMsg }));
  }, [lang, t.winnerMsg]);

  const entries = rawText.split('\n').filter(l => l.trim() !== "");

  const addWheel = () => {
    if (wheels.length < 4) setWheels([...wheels, Date.now()]);
    else alert(t.maxWheels);
  };

  const removeWheel = (id: number) => {
    if (wheels.length > 1) setWheels(wheels.filter(w => w !== id));
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  };

  const handleWinner = (name: string) => {
    setWinner(name);
    setResults(prev => [name, ...prev]);
    if (settings.launchConfetti) {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col font-sans overflow-hidden">
      <nav className="h-12 bg-[#1e1e1e] border-b border-white/10 flex items-center px-4 justify-between shrink-0 text-[13px]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-blue-500 via-red-500 to-green-500 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
          <span className="font-semibold text-white text-base">wheelofnames.com</span>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={() => setModals({...modals, settings: true})} className="px-3 py-2 hover:bg-white/10 rounded flex items-center gap-1.5">
            <Settings size={16} className="text-gray-400"/> <span>{t.customize}</span>
          </button>
          <button onClick={() => { if(confirm(t.confirmNew)) setRawText(""); }} className="px-3 py-2 hover:bg-white/10 rounded flex items-center gap-1.5">
            <FilePlus size={16} className="text-gray-400"/> <span>{t.new}</span>
          </button>
          <button onClick={() => setModals({...modals, open: true})} className="px-3 py-2 hover:bg-white/10 rounded flex items-center gap-1.5">
            <FolderOpen size={16} className="text-gray-400"/> <span>{t.open}</span>
          </button>
          <button onClick={() => setModals({...modals, save: true})} className="px-3 py-2 hover:bg-white/10 rounded flex items-center gap-1.5 font-bold">
            <Save size={16} className="text-gray-400"/> <span>{t.save}</span>
          </button>
          <button onClick={() => setModals({...modals, share: true})} className="px-3 py-2 hover:bg-white/10 rounded flex items-center gap-1.5">
            <Share2 size={16} className="text-gray-400"/> <span>{t.share}</span>
          </button>
          <div className="h-6 w-px bg-white/10 mx-1"></div>
          <button onClick={toggleFullScreen} className="px-3 py-2 hover:bg-white/10 rounded"><Maximize size={16}/></button>
          <button onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')} className="px-3 py-2 hover:bg-white/10 rounded flex items-center gap-1.5">
            <Globe size={16} className="text-blue-400"/> <span className="font-bold">{t.langName}</span>
          </button>
        </div>
      </nav>

      <div className="flex-1 flex flex-col md:flex-row p-4 gap-4 overflow-hidden">
        <div className={`flex-1 grid gap-4 ${wheels.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {wheels.map((id) => (
            <div key={id} className="relative bg-[#1a1a1c] rounded-3xl border border-white/5 flex items-center justify-center">
              {wheels.length > 1 && (
                <button onClick={() => removeWheel(id)} className="absolute top-4 right-4 z-10 p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-full"><X size={16}/></button>
              )}
              <WheelCanvas entries={entries} settings={settings} onWinner={handleWinner} setIsSpinning={setIsSpinning} />
            </div>
          ))}
        </div>

        <div className="w-full md:w-[420px] bg-[#1e1e1e] rounded-3xl flex flex-col border border-white/10 shadow-2xl">
          <div className="flex border-b border-white/10">
            <button onClick={() => setActiveTab('entries')} className={`flex-1 py-4 text-xs font-black uppercase ${activeTab === 'entries' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}>{t.entries} ({entries.length})</button>
            <button onClick={() => setActiveTab('results')} className={`flex-1 py-4 text-xs font-black uppercase ${activeTab === 'results' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}>{t.results} ({results.length})</button>
          </div>
          <div className="flex-1 flex flex-col p-5 gap-4 overflow-hidden">
            {activeTab === 'entries' ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setRawText([...entries].sort(() => Math.random() - 0.5).join('\n'))} className="bg-[#2d2d2d] py-2 rounded-lg text-[11px] font-bold uppercase flex items-center justify-center gap-2"><Shuffle size={14}/> {t.shuffle}</button>
                  <button onClick={() => setRawText([...entries].sort((a,b) => a.localeCompare(b)).join('\n'))} className="bg-[#2d2d2d] py-2 rounded-lg text-[11px] font-bold uppercase flex items-center justify-center gap-2"><SortAsc size={14}/> {t.sort}</button>
                </div>
                <textarea className="flex-1 bg-[#121212] border border-white/5 rounded-2xl p-4 font-mono text-sm outline-none resize-none" value={rawText} onChange={(e) => setRawText(e.target.value)} placeholder={t.placeholder}/>
                <button onClick={addWheel} className="w-full bg-blue-600 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-500 transition-all"><Plus size={18}/> {t.addWheel}</button>
              </>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2">
                {results.length === 0 && <p className="text-center text-gray-600 mt-20 italic">{t.noWinner}</p>}
                {results.map((res, i) => (
                  <div key={i} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5 group">
                    <span className="font-bold text-sm">{res}</span>
                    <button onClick={() => setResults(results.filter((_, idx) => idx !== i))} className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {modals.settings && <SettingsModal lang={lang} settings={settings} setSettings={setSettings} onClose={() => setModals({...modals, settings: false})} />}
      {modals.open && <OpenModal lang={lang} onClose={() => setModals({...modals, open: false})} onLoadData={(t) => setRawText(t)} />}
      {modals.save && <SaveModal lang={lang} onClose={() => setModals({...modals, save: false})} entries={entries} />}
      {modals.share && <ShareModal lang={lang} onClose={() => setModals({...modals, share: false})} />}

      {winner && !isSpinning && settings.showWinnerPopup && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1e1e1e] p-10 rounded-[40px] text-center border border-white/10 max-w-sm w-full">
            <h2 className="text-blue-500 font-bold uppercase text-xs mb-4">{t.winnerMsg}</h2>
            <div className="text-4xl font-black mb-8 text-white">{winner}</div>
            <button onClick={() => setWinner(null)} className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-gray-200">Continuar</button>
          </div>
        </div>
      )}
    </div>
  );
}