"use client";
import React, { useState } from 'react';
import { X, Save, Download, CloudUpload } from 'lucide-react'; // Adicionei CloudUpload para o visual

interface SaveModalProps {
  lang: 'pt' | 'en';
  onClose: () => void;
  entries: string[];
  // 1. Adicionamos a prop onSave na interface
  onSave: (wheelName: string) => Promise<void>; 
}

const translations = {
  pt: {
    title: "Salvar Roda",
    saveLocal: "Descarregar Ficheiro",
    saveLocalDesc: "A lista será guardada como um ficheiro .txt no seu computador.",
    saveCloud: "Salvar na Nuvem",
    saveCloudDesc: "Sincronize esta roda com a sua conta para aceder em qualquer lugar.",
    placeholder: "Ex: Nomes para o Sorteio",
    btnDownload: "Descarregar agora",
    btnSave: "Salvar no Banco de Dados",
    close: "Cancelar",
    wheelNameLabel: "Dê um nome à sua lista"
  },
  en: {
    title: "Save Wheel",
    saveLocal: "Download File",
    saveLocalDesc: "The list will be saved as a .txt file on your computer.",
    saveCloud: "Save to Cloud",
    saveCloudDesc: "Sync this wheel to your account to access it anywhere.",
    placeholder: "Ex: Names for Raffle",
    btnDownload: "Download now",
    btnSave: "Save to Database",
    close: "Cancel",
    wheelNameLabel: "Give your list a name"
  }
};

export default function SaveModal({ lang, onClose, entries, onSave }: SaveModalProps) {
  const t = translations[lang];
  const [wheelName, setWheelName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Função para Download do ficheiro .txt
  const downloadTxtFile = () => {
    const element = document.createElement("a");
    const file = new Blob([entries.join('\n')], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${wheelName || "roda-de-nomes"}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    onClose();
  };

  // 2. Função para disparar o salvamento no Supabase
  const handleCloudSave = async () => {
    if (!wheelName.trim()) {
      alert(lang === 'pt' ? "Por favor, dê um nome à roda" : "Please give the wheel a name");
      return;
    }
    setIsSaving(true);
    try {
      await onSave(wheelName);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
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

        <div className="p-6 space-y-4">
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

          {/* Opção 1: Salvar na Nuvem (Supabase) */}
          <div className="p-4 bg-blue-500/10 rounded-3xl border border-blue-500/20 space-y-3">
            <div className="flex items-center gap-3 text-blue-400">
              <CloudUpload size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">{t.saveCloud}</span>
            </div>
            <button 
              onClick={handleCloudSave}
              disabled={isSaving}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95"
            >
              {isSaving ? "..." : t.btnSave}
            </button>
          </div>

          {/* Opção 2: Download Local */}
          <div className="p-4 bg-white/5 rounded-3xl border border-white/5 space-y-3">
             <div className="flex items-center gap-3 text-gray-400">
              <Download size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">{t.saveLocal}</span>
            </div>
            <button 
              onClick={downloadTxtFile}
              className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm transition-all active:scale-95"
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