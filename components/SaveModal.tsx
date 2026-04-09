"use client";
import React, { useState } from 'react';
import { X, Save, HardDrive, Info, ChevronDown } from 'lucide-react';

interface SaveModalProps {
  onClose: () => void;
  entries: string[];
}

export default function SaveModal({ onClose, entries }: SaveModalProps) {
  const [wheelName, setWheelName] = useState("");

  // Função para salvar localmente como arquivo .txt
  const handleSaveLocal = () => {
    const element = document.createElement("a");
    const file = new Blob([entries.join('\n')], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${wheelName || 'minha-roda'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Função para simular salvar na nuvem
  const handleSaveCloud = () => {
    if (!wheelName.trim()) {
      alert("Por favor, insira um nome para a roda.");
      return;
    }
    alert(`Roda "${wheelName}" salva na nuvem com sucesso! (Simulação)`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#1e1e1e] w-full max-w-lg rounded-xl shadow-2xl border border-white/10 overflow-hidden text-white">
        
        {/* CABEÇALHO */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Save size={18} />
            <h3 className="font-bold text-base">Salve a roda na nuvem</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] font-bold">j</div>
            <ChevronDown size={16} className="text-gray-400" />
          </div>
        </div>

        {/* CONTEÚDO */}
        <div className="p-6 space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400 font-medium">Salvar como</label>
            <input 
              type="text"
              value={wheelName}
              onChange={(e) => setWheelName(e.target.value)}
              className="w-full bg-[#2d2d2d] border border-blue-500/50 rounded-md p-3 outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              placeholder="Digite o nome da roda..."
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400 font-medium">Suas rodas</label>
            <div className="w-full bg-[#2d2d2d] border border-white/5 rounded-md p-3 flex justify-between items-center text-gray-500 text-sm cursor-not-allowed">
              Selecione uma roda
              <ChevronDown size={16} />
            </div>
          </div>

          <p className="text-[13px] text-gray-300 leading-relaxed">
            Você sempre poderá acessar suas rodas salvas, desde que abra ou salve qualquer roda pelo menos uma vez a cada 12 meses.
          </p>

          <button 
            onClick={handleSaveLocal}
            className="flex items-center gap-2 text-blue-500 border border-blue-500/30 px-4 py-2.5 rounded-md hover:bg-blue-500/5 transition-colors text-sm font-medium"
          >
            Salve em um arquivo local
          </button>
        </div>

        {/* RODAPÉ */}
        <div className="p-4 flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-white hover:text-gray-300 transition-colors">
            Cancelar
          </button>
          <button 
            onClick={handleSaveCloud}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-md transition-all active:scale-95 shadow-lg shadow-blue-900/20"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}