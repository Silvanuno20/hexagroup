"use client";
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { X, Database, Loader2, ChevronRight, ArrowLeft, Clock, Search, LayoutGrid, List, FileUp } from 'lucide-react';

export default function OpenModal({ lang, onClose, listWheels, onLoadWheel, setRawText }: any) {
  const [view, setView] = useState<'menu' | 'cloud'>('menu');
  const [wheels, setWheels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAll, setShowAll] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (view === 'cloud') {
      setIsLoading(true);
      listWheels().then(setWheels).finally(() => setIsLoading(false));
    }
  }, [view, listWheels]);

  // Lógica para carregar ficheiro local (.txt)
  const handleLocalFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawText(content);
      onClose();
    };
    reader.readAsText(file);
  };

  const filtered = useMemo(() => {
    const results = wheels.filter(w => w.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    // Se não estiver em modo "grelha" e não houver pesquisa, mostra apenas 4
    if (!showAll && searchTerm === "") {
      return results.slice(0, 4);
    }
    return results;
  }, [wheels, searchTerm, showAll]);

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className={`bg-[#0a0a0a] w-full rounded-[32px] border border-white/10 flex flex-col transition-all duration-300 shadow-2xl overflow-hidden ${showAll ? 'max-w-4xl h-[80vh]' : 'max-w-md h-[550px]'}`}>
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-3">
            {view !== 'menu' && (
              <button onClick={() => { setView('menu'); setShowAll(false); }} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <ArrowLeft size={20} />
              </button>
            )}
            <h2 className="font-black uppercase tracking-tighter text-lg">
              {view === 'menu' ? 'Abrir Projeto' : (showAll ? 'Biblioteca de Rodas' : 'Recentes')}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {view === 'menu' ? (
            <div className="grid gap-4">
              {/* Opção Nuvem */}
              <button onClick={() => setView('cloud')} className="w-full p-6 bg-white/5 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-all border border-white/5 group">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-colors">
                    <Database className="text-purple-500" size={24} />
                  </div>
                  <div className="text-left">
                    <span className="block font-bold text-white">Nuvem Supabase</span>
                    <span className="block text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">Ver salvos online</span>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-600" />
              </button>

              {/* Opção Local */}
              <input type="file" accept=".txt" ref={fileInputRef} onChange={handleLocalFile} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="w-full p-6 bg-white/5 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-all border border-white/5 group">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors">
                    <FileUp className="text-blue-500" size={24} />
                  </div>
                  <div className="text-left">
                    <span className="block font-bold text-white">Ficheiro Local</span>
                    <span className="block text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">Carregar do dispositivo</span>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-600" />
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input 
                  placeholder="Pesquisar..." 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-11 py-3 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                />
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                  <Loader2 className="animate-spin mb-4" size={32} />
                  <span className="text-[10px] font-black uppercase tracking-[3px]">Sincronizando...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Container Dinâmico: Lista ou Grelha */}
                  <div className={showAll || searchTerm !== "" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-2"}>
                    {filtered.map(wheel => (
                      <button 
                        key={wheel.id} 
                        onClick={() => { onLoadWheel(wheel.id); onClose(); }} 
                        className={`w-full p-4 bg-white/[0.02] rounded-2xl flex border border-white/5 group transition-all hover:bg-white/[0.06] ${showAll || searchTerm !== "" ? 'flex-col items-start gap-3' : 'items-center justify-between'}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-white/5 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                            <Database size={16} className="text-gray-500 group-hover:text-purple-400" />
                          </div>
                          <div className="text-left">
                            <span className="block font-bold text-sm text-gray-200 group-hover:text-white truncate max-w-[150px]">
                              {wheel.name}
                            </span>
                            <span className="text-[9px] text-gray-600 flex items-center gap-1 uppercase font-bold mt-1 tracking-wider">
                              <Clock size={10} /> {new Date(wheel.updated_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        {!(showAll || searchTerm !== "") && <ChevronRight size={14} className="text-gray-700" />}
                      </button>
                    ))}
                  </div>

                  {!showAll && searchTerm === "" && wheels.length > 4 && (
                    <button 
                      onClick={() => setShowAll(true)}
                      className="w-full py-4 mt-2 border border-dashed border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[3px] text-gray-500 hover:text-white hover:bg-purple-500/5 hover:border-purple-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <LayoutGrid size={14} />
                      Ver todos os projetos em grelha ({wheels.length})
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}