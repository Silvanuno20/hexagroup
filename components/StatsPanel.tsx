"use client";
import React from 'react';
import { X } from 'lucide-react';

interface StatsPanelProps {
  entries: { nome: string; quantidade: number }[];
  onClose: () => void;
}

export default function StatsPanel({ entries, onClose }: StatsPanelProps) {
  const total = entries.reduce((acc, e) => acc + e.quantidade, 0);

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0f0f0f] border border-white/10 rounded-[48px] w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-xl font-black uppercase tracking-wider text-white">Probabilidades</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-gray-400">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-black uppercase tracking-widest text-gray-500 border-b border-white/5">
                <th className="pb-3">Produto</th>
                <th className="pb-3 text-center">Qtd</th>
                <th className="pb-3 text-right">Probabilidade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {entries.map((item, i) => {
                const percent = total > 0 ? ((item.quantidade / total) * 100).toFixed(1) : '0.0';
                const colors = ['#FF3D00', '#3D5AFE', '#00E676', '#D500F9', '#FFFF00', '#00E5FF'];
                return (
                  <tr key={i} className="text-sm">
                    <td className="py-3 flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[i % colors.length] }}></span>
                      <span className="font-medium">{item.nome}</span>
                    </td>
                    <td className="py-3 text-center text-gray-400">{item.quantidade}</td>
                    <td className="py-3 text-right text-blue-400 font-mono">{percent}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {entries.length === 0 && (
            <p className="text-center text-gray-500 py-8">Nenhum produto adicionado.</p>
          )}
        </div>
      </div>
    </div>
  );
}