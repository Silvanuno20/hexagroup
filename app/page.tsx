"use client";
import React, { useState } from 'react';
import { 
  Settings, Shuffle, SortAsc, Plus, Trash2, 
  FilePlus, FolderOpen, Save, Share2, 
  Maximize, Globe, ChevronDown 
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Importando componentes e hooks
import SettingsModal from '@/components/SettingsModal';
import WheelCanvas from '@/components/Wheelcanvas';
import OpenModal from '@/components/OpenModal';
import SaveModal from '@/components/SaveModal';
import ShareModal from '@/components/ShareModal';
import { useWheelPersistence } from '@/hooks/useWheelPersistence';

// 1. Dicionário de Traduções
const translations = {
  pt: {
    customize: "Customizar",
    new: "Novo",
    open: "Abrir",
    save: "Salvar",
    share: "Compartilhar",
    entries: "Entradas",
    results: "Resultados",
    shuffle: "Baralhar",
    sort: "Ordenar",
    addWheel: "Adicionar roda",
    placeholder: "Insira os nomes aqui...",
    noWinner: "Nenhum vencedor ainda...",
    langName: "Português",
    confirmNew: "Tem certeza que deseja criar uma nova roda? Isso apagará todos os nomes atuais.",
    winnerMsg: "Temos um vencedor!"
  },
  en: {
    customize: "Customize",
    new: "New",
    open: "Open",
    save: "Save",
    share: "Share",
    entries: "Entries",
    results: "Results",
    shuffle: "Shuffle",
    sort: "Sort",
    addWheel: "Add wheel",
    placeholder: "Enter names here...",
    noWinner: "No winner yet...",
    langName: "English",
    confirmNew: "Are you sure you want to create a new wheel? This will erase all current names.",
    winnerMsg: "We have a winner!"
  }
};

export default function WheelPage() { 
  // 1. Lógica de Persistência
  const { rawText, setRawText, results, setResults } = useWheelPersistence();
  
  // 2. Estados da Interface
  const [lang, setLang] = useState<'pt' | 'en'>('pt');
  const t = translations[lang];
  
  const [activeTab, setActiveTab] = useState<'entries' | 'results'>('entries');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOpenModalOpen, setIsOpenModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  // 3. Configurações
  const [settings, setSettings] = useState({
    sound: 'Som de tique-taque',
    volume: 50,
    showDuplicates: true,
    spinSlowly: false,
    showTitle: true,
    spinTime: 10,
    maxNames: 1000,
    afterSpinSound: 'Aplausos moderados',
    afterSpinVolume: 50,
    animateWinner: false,
    launchConfetti: true,
    autoRemoveWinner: false,
    showWinnerPopup: true,
    winnerMessage: t.winnerMsg,
    showRemoveButton: true,
    playClickOnRemove: false 
  });

  const entries = rawText.split('\n').filter(l => l.trim() !== "");

  // --- FUNÇÕES DE AÇÃO ---

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.error(`Erro ao ativar tela cheia: ${e.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const toggleLanguage = () => {
    setLang(prev => prev === 'pt' ? 'en' : 'pt');
  };

  const handleNewWheel = () => {
    if (confirm(t.confirmNew)) {
      setRawText("");
      setResults([]);
      setWinner(null);
    }
  };

  const handleLoadData = (text: string) => {
    setRawText(text);
  };

  const handleWinner = (name: string) => {
    setWinner(name);
    setResults(prev => [name, ...prev]);

    if (settings.launchConfetti) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3369E8', '#D50F25', '#EEB211', '#009925']
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col font-sans overflow-hidden">
      
      {/* CABEÇALHO */}
      <nav className="h-12 bg-[#1e1e1e] border-b border-white/10 flex items-center px-4 justify-between shrink-0 text-[#cccccc] text-[13px]">
        <div className="flex items-center gap-2 mr-4">
          <div className="w-7 h-7 bg-gradient-to-br from-blue-500 via-red-500 to-green-500 rounded-full flex items-center justify-center shadow-lg">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
          <span className="font-semibold text-white text-base tracking-tight">wheelofnames.com</span>
        </div>

        <div className="flex items-center gap-1 flex-1 justify-end">
          <button onClick={() => setIsSettingsOpen(true)} className="flex items-center gap-1.5 px-3 py-2 hover:bg-white/10 rounded transition-colors">
            <Settings size={16} className="text-gray-400"/> 
            <span>{t.customize}</span>
          </button>
          
          <button onClick={handleNewWheel} className="flex items-center gap-1.5 px-3 py-2 hover:bg-white/10 rounded transition-colors">
            <FilePlus size={16} className="text-gray-400"/> 
            <span>{t.new}</span>
          </button>

          <button onClick={() => setIsOpenModalOpen(true)} className="flex items-center gap-1.5 px-3 py-2 hover:bg-white/10 rounded transition-colors">
            <FolderOpen size={16} className="text-gray-400"/> 
            <span>{t.open}</span>
          </button>

          <button onClick={() => setIsSaveModalOpen(true)} className="flex items-center gap-1.5 px-3 py-2 hover:bg-white/10 rounded transition-colors font-bold text-white">
            <Save size={16} className="text-gray-400"/> 
            <span>{t.save}</span>
          </button>

          <button onClick={() => setIsShareModalOpen(true)} className="flex items-center gap-1.5 px-3 py-2 hover:bg-white/10 rounded transition-colors">
            <Share2 size={16} className="text-gray-400"/> 
            <span>{t.share}</span>
          </button>

          <div className="h-6 w-px bg-white/10 mx-1"></div>

          {/* BOTÃO TELA CHEIA */}
          <button onClick={toggleFullScreen} className="flex items-center gap-1.5 px-3 py-2 hover:bg-white/10 rounded transition-colors">
            <Maximize size={16} className="text-gray-400"/>
          </button>

          <div className="h-6 w-px bg-white/10 mx-1"></div>

          {/* BOTÃO DE IDIOMA */}
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-2 hover:bg-white/10 rounded transition-colors text-white"
          >
            <Globe size={16} className="text-gray-400"/> 
            <span className="font-medium">{t.langName}</span>
            <ChevronDown size={14} />
          </button>
        </div>
      </nav>

      {/* ÁREA PRINCIPAL */}
      <div className="flex-1 flex flex-col md:flex-row p-4 gap-4 overflow-hidden bg-gradient-to-b from-[#121212] to-[#1a1a1c]">
        <div className="flex-[2] flex flex-col items-center justify-center bg-[#1a1a1c]/50 rounded-3xl border border-white/5 relative shadow-inner">
          <WheelCanvas 
            entries={entries} 
            settings={settings} 
            onWinner={handleWinner}
            setIsSpinning={setIsSpinning}
          />
        </div>

        <div className="w-full md:w-[420px] bg-[#1e1e1e] rounded-3xl flex flex-col border border-white/10 shadow-2xl overflow-hidden transition-all">
          <div className="flex border-b border-white/10 bg-[#252526]">
            <button 
              onClick={() => setActiveTab('entries')} 
              className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'entries' ? 'text-blue-500 border-b-2 border-blue-500 bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {t.entries} ({entries.length})
            </button>
            <button 
              onClick={() => setActiveTab('results')} 
              className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'results' ? 'text-blue-500 border-b-2 border-blue-500 bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {t.results} ({results.length})
            </button>
          </div>

          <div className="flex-1 flex flex-col p-5 gap-4 overflow-hidden">
            {activeTab === 'entries' ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setRawText([...entries].sort(() => Math.random() - 0.5).join('\n'))} className="flex items-center justify-center gap-2 bg-[#2d2d2d] py-2.5 rounded-lg text-[11px] font-bold hover:bg-[#3d3d3d] transition-colors uppercase"><Shuffle size={14}/> {t.shuffle}</button>
                  <button onClick={() => setRawText([...entries].sort((a,b) => a.localeCompare(b)).join('\n'))} className="flex items-center justify-center gap-2 bg-[#2d2d2d] py-2.5 rounded-lg text-[11px] font-bold hover:bg-[#3d3d3d] transition-colors uppercase"><SortAsc size={14}/> {t.sort}</button>
                </div>
                <textarea 
                  className="flex-1 bg-[#121212] border border-white/5 rounded-2xl p-4 font-mono text-sm outline-none focus:ring-2 focus:ring-blue-500/50 resize-none custom-scrollbar" 
                  value={rawText} 
                  onChange={(e) => setRawText(e.target.value)} 
                  placeholder={t.placeholder}
                />
                <button className="w-full bg-blue-600 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-500 shadow-lg shadow-blue-900/20 transition-all active:scale-95">
                  <Plus size={18}/> {t.addWheel}
                </button>
              </>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
                {results.length === 0 && <p className="text-center text-gray-600 mt-20 text-sm italic">{t.noWinner}</p>}
                {results.map((res, i) => (
                  <div key={i} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-colors group">
                    <span className="font-bold text-sm tracking-wide">{res}</span>
                    <button onClick={() => setResults(results.filter((_, idx) => idx !== i))} className="text-gray-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="p-3 bg-[#18181b] border-t border-white/5 flex justify-between items-center px-6">
             <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Versão 4.0.5</span>
             <button className="text-[10px] text-blue-500 font-bold uppercase hover:underline">Changelog</button>
          </div>
        </div>
      </div>

      {/* MODAIS */}
      {isSettingsOpen && (
        <SettingsModal settings={settings} setSettings={setSettings} onClose={() => setIsSettingsOpen(false)} />
      )}

      {isOpenModalOpen && (
        <OpenModal 
          onClose={() => setIsOpenModalOpen(false)} 
          onLoadData={handleLoadData} 
        />
      )}

      {isSaveModalOpen && (
        <SaveModal 
          onClose={() => setIsSaveModalOpen(false)} 
          entries={entries} 
        />
      )}

      {isShareModalOpen && (
        <ShareModal 
          wheelTitle="pi" 
          onClose={() => setIsShareModalOpen(false)} 
        />
      )}

      {/* POP-UP DO VENCEDOR */}
      {winner && !isSpinning && settings.showWinnerPopup && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-300">
          <div className="bg-[#1e1e1e] p-10 rounded-[48px] text-center shadow-[0_0_100px_rgba(51,105,232,0.3)] border border-white/10 max-w-md w-full relative">
            <h2 className="text-blue-500 font-black uppercase tracking-[0.2em] text-xs mb-6">{t.winnerMsg}</h2>
            <div className="text-6xl font-black mb-12 text-white drop-shadow-lg break-words px-2">{winner}</div>
            <div className="flex flex-col gap-3">
              <button onClick={() => setWinner(null)} className="w-full py-5 bg-white text-black font-black rounded-3xl hover:bg-gray-200 transition-all active:scale-95 text-sm uppercase tracking-widest">
                Continuar
              </button>
              {settings.showRemoveButton && (
                <button onClick={() => {
                  setRawText(entries.filter(e => e !== winner).join('\n'));
                  setWinner(null);
                }} className="w-full py-5 bg-transparent border-2 border-white/10 text-white font-bold rounded-3xl hover:bg-white/5 transition-all text-sm uppercase tracking-widest">
                  Remover "{winner}"
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}