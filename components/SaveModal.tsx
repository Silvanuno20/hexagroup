"use client";
import React, { useState } from 'react';
import { X, Save, Download, CloudUpload, Loader2 } from 'lucide-react';

interface SaveModalProps {
  lang: 'pt' | 'en';
  onClose: () => void;
  entries: string[]; 
  onSave: (wheelName: string) => Promise<void>;
}

export default function SaveModal({ lang, onClose, entries, onSave }: SaveModalProps) {
  const [wheelName, setWheelName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const t = {
    pt: {
      title: "Salvar Roda",
      wheelNameLabel: "Nome da lista / Arquivo",
      placeholder: "Digite o nome aqui...",
      saveCloud: "Salvar na Nuvem",
      saveLocal: "Descarregar Localmente",
      confirm: "Confirmar e Salvar",
      cancel: "Cancelar"
    },
    en: {
      title: "Save Wheel",
      wheelNameLabel: "List / File Name",
      placeholder: "Type the name here...",
      saveCloud: "Save to Cloud",
      saveLocal: "Download Locally",
      confirm: "Confirm and Save",
      cancel: "Cancel"
    }
  }[lang];

  // FUNÇÃO: DOWNLOAD LOCAL (.txt) usando o nome escolhido
  const downloadTxtFile = () => {
    // Se o usuário não digitou nada, usa um nome padrão
    const fileName = wheelName.trim() ? wheelName : (lang === 'pt' ? "minha-roda" : "my-wheel");
    
    const element = document.createElement("a");
    const file = new Blob([entries.join('\n')], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${fileName}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    onClose();
  };

  // FUNÇÃO: SALVAR NA NUVEM
  const handleCloudSave = async () => {
    if (!wheelName.trim()) {
        alert(lang === 'pt' ? "Por favor, digite um nome." : "Please enter a name.");
        return;
    }
    setIsSaving(true);
    await onSave(wheelName);
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0f0f0f] w-full max-w-sm rounded-[40px] border border-white/10 shadow-2xl overflow-hidden flex flex-col">
        
        {/* HEADER */}
        <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <h2 className="text-lg font-black uppercase tracking-tighter flex items-center gap-2">
            <Save className="text-blue-500" size={18} />
            {t.title}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* INPUT NOME (USADO PARA AMBOS) */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-gray-500 tracking-[2px] ml-1">
              {t.wheelNameLabel}
            </label>
            <input 
              type="text"
              value={wheelName}
              onChange={(e) => setWheelName(e.target.value)}
              placeholder={t.placeholder}
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:ring-2 focus:ring-blue-500/50 font-bold transition-all"
              autoFocus
            />
          </div>

          {/* OPÇÃO 1: NUVEM */}
          <div className="space-y-3">
            <span className="text-[9px] font-bold text-blue-500/50 uppercase tracking-widest flex items-center gap-2">
              <CloudUpload size={12} /> {t.saveCloud}
            </span>
            <button 
              onClick={handleCloudSave}
              disabled={isSaving || !wheelName.trim()}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 active:scale-95"
            >
              {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              {t.confirm}
            </button>
          </div>

          {/* OPÇÃO 2: LOCAL */}
          <div className="pt-4 border-t border-white/5">
             <button 
              onClick={downloadTxtFile}
              className="w-full py-4 bg-transparent hover:bg-white/5 text-gray-400 hover:text-white rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2"
            >
              <Download size={16} />
              {t.saveLocal}
            </button>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-8 py-5 bg-black/40 flex justify-center">
          <button onClick={onClose} className="text-[10px] font-black uppercase tracking-[3px] text-gray-700 hover:text-white transition-colors">
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
}