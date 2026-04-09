"use client";
import React from 'react';
import { X, HardDrive, FileText, UploadCloud } from 'lucide-react';

interface OpenModalProps {
  lang: 'pt' | 'en';
  onClose: () => void;
  onLoadData: (text: string) => void;
}

const translations = {
  pt: {
    title: "Abrir Roda",
    localTitle: "Ficheiro Local",
    localDesc: "Escolha um ficheiro .txt do seu computador para carregar os nomes.",
    selectFile: "Selecionar Ficheiro",
    history: "Recentes (Neste Navegador)",
    noHistory: "Nenhuma roda encontrada no armazenamento local.",
    close: "Fechar"
  },
  en: {
    title: "Open Wheel",
    localTitle: "Local File",
    localDesc: "Choose a .txt file from your computer to load the names.",
    selectFile: "Select File",
    history: "Recent (In this Browser)",
    noHistory: "No wheels found in local storage.",
    close: "Close"
  }
};

export default function OpenModal({ lang, onClose, onLoadData }: OpenModalProps) {
  const t = translations[lang];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      onLoadData(content);
      onClose();
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1e1e1e] w-full max-w-md rounded-[32px] border border-white/10 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-[#252526]">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FolderOpen className="text-blue-500" size={22} />
            {t.title}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full text-gray-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-8">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 mb-2">
              <FileText size={40} />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{t.localTitle}</h3>
              <p className="text-sm text-gray-400 leading-relaxed px-4">
                {t.localDesc}
              </p>
            </div>

            <input 
              type="file" 
              accept=".txt" 
              onChange={handleFileChange}
              className="hidden" 
              id="file-upload"
            />
            
            <label 
              htmlFor="file-upload"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold cursor-pointer transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 active:scale-[0.98]"
            >
              <UploadCloud size={20} />
              {t.selectFile}
            </label>
          </div>

          {/* Divisória Suave */}
          <div className="mt-10 pt-6 border-t border-white/5">
            <h4 className="text-[11px] font-black uppercase text-gray-500 tracking-widest mb-4 flex items-center gap-2">
              <HardDrive size={12} />
              {t.history}
            </h4>
            
            <div className="bg-black/20 rounded-2xl p-6 border border-white/5 italic text-sm text-gray-600 text-center">
              {t.noHistory}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#181819] flex justify-end">
          <button 
            onClick={onClose}
            className="text-sm font-bold text-gray-400 hover:text-white transition-colors"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}

// Componente de ícone auxiliar (FolderOpen não estava no import inicial, adicionado aqui)
function FolderOpen({ size, className }: { size: number, className: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2" />
    </svg>
  );
}