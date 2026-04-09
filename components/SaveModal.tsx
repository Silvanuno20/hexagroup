"use client";
import React, { useState } from 'react';
import { X, Save, Download } from 'lucide-react';

interface SaveModalProps {
  lang: 'pt' | 'en';
  onClose: () => void;
  entries: string[];
}

const translations = {
  pt: {
    title: "Salvar Roda",
    saveLocal: "Descarregar Ficheiro",
    saveLocalDesc: "A lista será guardada como um ficheiro .txt no seu computador.",
    placeholder: "Ex: Nomes para o Sorteio",
    btnDownload: "Descarregar agora",
    close: "Cancelar",
    wheelNameLabel: "Dê um nome à sua lista"
  },
  en: {
    title: "Save Wheel",
    saveLocal: "Download File",
    saveLocalDesc: "The list will be saved as a .txt file on your computer.",
    placeholder: "Ex: Names for Raffle",
    btnDownload: "Download now",
    close: "Cancel",
    wheelNameLabel: "Give your list a name"
  }
};

export default function SaveModal({ lang, onClose, entries }: SaveModalProps) {
  const t = translations[lang];
  const [wheelName, setWheelName] = useState("");

  // Função única: Download do ficheiro .txt
  const downloadTxtFile = () => {
    const element = document.createElement("a");
    const file = new Blob([entries.join('\n')], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${wheelName || "roda-de-nomes"}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    onClose(); // Fecha o modal após o download
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1e1e1e] w-full max-w-sm rounded-[32px] border border-white/10 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-[#252526]">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Save className="text-blue-500" size={20} />
            {t.title}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Campo de Nome */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase text-gray-500 tracking-widest px-1">
              {t.wheelNameLabel}
            </label>
            <input 
              type="text"
              value={wheelName}
              onChange={(e) => setWheelName(e.target.value)}
              placeholder={t.placeholder}
              className="w-full bg-black/30 border border-white/10 rounded-2xl px-4 py-4 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              autoFocus
            />
          </div>

          {/* Área de Download Única */}
          <div className="p-5 bg-blue-500/5 rounded-3xl border border-blue-500/10 space-y-4 text-center">
            <div className="mx-auto w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500">
              <Download size={24} />
            </div>
            <p className="text-xs text-gray-400 px-2">
              {t.saveLocalDesc}
            </p>
            <button 
              onClick={downloadTxtFile}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-blue-900/20 active:scale-95"
            >
              {t.btnDownload}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#181819] flex justify-center">
          <button onClick={onClose} className="text-xs font-bold text-gray-500 hover:text-white transition-colors">
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}