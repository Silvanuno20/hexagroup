"use client";
import React from 'react';
import { X, BarChart3 } from 'lucide-react';

interface StatsPanelProps {
  entries: { nome: string; quantidade: number }[];
  onClose: () => void;
}

export default function StatsPanel({ entries, onClose }: StatsPanelProps) {
  const totalQtd = entries.reduce((acc, curr) => acc + curr.quantidade, 0);

  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-end p-4 md:p-8 pointer-events-none">
      {/* Backdrop para fechar ao clicar fora (opcional) */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto" onClick={onClose} />
      
      {/* Painel Flutuante */}
      <div className="relative w-full max-w-md h-[80vh] bg-[#0f0f0f] border border-white/10 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden pointer-events-auto animate-in slide-in-from-right duration-300">
        
        {/* Header do Painel */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <BarChart3 size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-white">Probabilidades</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase">Análise de Stock Real</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-500 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Lista de Probabilidades */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {entries.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-700">
              <p className="text-xs uppercase font-black tracking-widest">Sem dados para analisar</p>
            </div>
          ) : (
            entries.map((item, i) => {
              const porcentagem = totalQtd > 0 ? ((item.quantidade / totalQtd) * 100).toFixed(1) : "0";
              
              return (
                <div key={i} className="group bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 p-4 rounded-3xl transition-all">
                  <div className="flex justify-between items-end mb-3">
                    <span className="font-bold text-gray-200">{item.nome}</span>
                    <div className="text-right">
                      <span className="text-xl font-black text-blue-500 leading-none">{porcentagem}%</span>
                    </div>
                  </div>
                  
                  {/* Barra de Progresso */}
                  <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all duration-1000 ease-out" 
                      style={{ width: `${porcentagem}%` }}
                    />
                  </div>
                  
                  <div className="mt-2 flex justify-between items-center text-[9px] font-black uppercase tracking-tighter text-gray-600">
                    <span>{item.quantidade} Unidades em Stock</span>
                    <span>Total: {totalQtd}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {/* Footer Info */}
        <div className="p-6 bg-black/40 text-center text-[9px] text-gray-700 font-bold uppercase tracking-[2px]">
          Builders World • Sorteio Ponderado
        </div>
      </div>
    </div>
  );
}