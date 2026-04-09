"use client";
import React, { useRef } from 'react';
import { X, Cloud, Monitor, FileText, Info } from 'lucide-react';

interface OpenModalProps {
  onClose: () => void;
  onLoadData: (text: string) => void;
}

export default function OpenModal({ onClose, onLoadData }: OpenModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Função para carregar arquivo localmente (.txt)
  const handleLocalLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  // Função para simular carregamento na nuvem
  const handleCloudLoad = () => {
    alert("Conectando ao armazenamento em nuvem... (Simulação)");
    // Aqui você integraria com Firebase ou Google Drive futuramente
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#1e1e1e] w-full max-w-lg rounded-2xl shadow-2xl border border-white/10 overflow-hidden text-white">
        
        {/* CABEÇALHO */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#252526]">
          <h3 className="font-bold text-sm uppercase tracking-widest flex items-center gap-2">
            <FileText size={18} className="text-blue-500" /> Abrir Roda
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* CONTEÚDO */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-gray-400 mb-6">
            Escolha como você deseja carregar as suas listas de nomes:
          </p>

          <div className="grid grid-cols-1 gap-4">
            {/* BOTÃO NUVEM */}
            <button 
              onClick={handleCloudLoad}
              className="flex items-center gap-4 p-5 bg-[#2d2d2d] hover:bg-[#3d3d3d] border border-white/5 rounded-xl transition-all group"
            >
              <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                <Cloud size={24} />
              </div>
              <div className="text-left">
                <div className="font-bold text-sm">Carregar da Nuvem</div>
                <div className="text-[11px] text-gray-500">Acesse suas rodas salvas na sua conta.</div>
              </div>
            </button>

            {/* BOTÃO LOCAL */}
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-4 p-5 bg-[#2d2d2d] hover:bg-[#3d3d3d] border border-white/5 rounded-xl transition-all group"
            >
              <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                <Monitor size={24} />
              </div>
              <div className="text-left">
                <div className="font-bold text-sm">Carregar Localmente</div>
                <div className="text-[11px] text-gray-500">Abra um arquivo .txt do seu computador.</div>
              </div>
            </button>
            
            {/* Input de arquivo escondido */}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".txt" 
              onChange={handleLocalLoad}
            />
          </div>

          <div className="mt-6 flex items-start gap-2 p-3 bg-blue-500/5 rounded-lg border border-blue-500/10">
            <Info size={16} className="text-blue-500 shrink-0" />
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Dica: Você também pode simplesmente colar os nomes diretamente na caixa de texto na página principal.
            </p>
          </div>
        </div>

        {/* RODAPÉ */}
        <div className="p-4 bg-[#252526] flex justify-end border-t border-white/5">
          <button onClick={onClose} className="px-6 py-2 text-xs font-bold uppercase text-gray-400 hover:text-white transition-colors">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}