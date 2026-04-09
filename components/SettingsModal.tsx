"use client";
import React, { useState } from 'react';
import { Play, Square, HelpCircle } from 'lucide-react';

interface SettingsModalProps {
  settings: any;
  setSettings: (s: any) => void;
  onClose: () => void;
}

export default function SettingsModal({ settings, setSettings, onClose }: SettingsModalProps) {
  // Estado para controlar apenas as duas abas restantes
  const [activeTab, setActiveTab] = useState<'during' | 'after'>('during');

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#1e1e1e] w-full max-w-2xl rounded-xl shadow-2xl border border-white/10 overflow-hidden text-sm text-white">
        
        {/* NAVEGAÇÃO DE ABAS */}
        <div className="flex border-b border-white/5 bg-[#252526]">
          <button 
            onClick={() => setActiveTab('during')}
            className={`px-8 py-4 font-bold transition-all uppercase tracking-widest text-[11px] ${
              activeTab === 'during' ? 'text-white border-b-2 border-white bg-white/5' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Girando
          </button>
          <button 
            onClick={() => setActiveTab('after')}
            className={`px-8 py-4 font-bold transition-all uppercase tracking-widest text-[11px] ${
              activeTab === 'after' ? 'text-white border-b-2 border-white bg-white/5' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Depois do giro
          </button>
        </div>

        {/* CONTEÚDO DINÂMICO */}
        <div className="p-8 space-y-6 max-h-[65vh] overflow-y-auto custom-scrollbar">
          
          {/* --- ABA: GIRANDO --- */}
          {activeTab === 'during' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* SELETOR DE SOM */}
              <div className="flex items-center gap-4">
                <label className="w-32 font-medium text-gray-300">Som</label>
                <select 
                  className="flex-1 bg-[#2d2d2d] border border-white/10 p-2 rounded outline-none" 
                  value={settings.sound} 
                  onChange={(e) => setSettings({...settings, sound: e.target.value})}
                >
                  <option>Som de tique-taque</option>
                  <option>Nenhum</option>
                </select>
                <div className="flex gap-2">
                  <Play size={18} className="text-gray-400 cursor-pointer hover:text-white"/>
                  <Square size={18} className="text-gray-400 cursor-pointer hover:text-white"/>
                </div>
              </div>

              {/* VOLUME */}
              <div className="space-y-4">
                <label className="block font-medium text-gray-300">Volume</label>
                <input 
                  type="range" 
                  className="w-full h-1 bg-blue-600 rounded-lg appearance-none cursor-pointer" 
                  value={settings.volume} 
                  onChange={(e) => setSettings({...settings, volume: parseInt(e.target.value)})} 
                />
                <div className="flex justify-between text-[10px] text-gray-500 font-bold">
                  <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
                </div>
              </div>

              {/* OPÇÕES RÁPIDAS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/5 pt-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={settings.showDuplicates} onChange={() => setSettings({...settings, showDuplicates: !settings.showDuplicates})} className="w-4 h-4 rounded border-gray-700 bg-blue-600" />
                  <span className="flex items-center gap-1">Exibir duplicatas <HelpCircle size={14} className="text-gray-500"/></span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={settings.spinSlowly} onChange={() => setSettings({...settings, spinSlowly: !settings.spinSlowly})} className="w-4 h-4 rounded border-gray-700 bg-blue-600" />
                  Gire devagar
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={settings.showTitle} onChange={() => setSettings({...settings, showTitle: !settings.showTitle})} className="w-4 h-4 rounded border-gray-700 bg-blue-600" />
                  Mostrar título
                </label>
              </div>

              {/* TEMPO DE GIRO */}
              <div className="space-y-4 border-t border-white/5 pt-6">
                <label className="block font-medium text-gray-300">Tempo de giro</label>
                <input 
                  type="range" min="1" max="60" 
                  className="w-full h-1 bg-blue-600 rounded-lg appearance-none cursor-pointer" 
                  value={settings.spinTime} 
                  onChange={(e) => setSettings({...settings, spinTime: parseInt(e.target.value)})} 
                />
                <div className="flex justify-between text-[10px] text-gray-500 font-bold">
                  {[1, 10, 20, 30, 40, 50, 60].map(v => <span key={v}>{v}</span>)}
                </div>
              </div>

              {/* MÁXIMO DE NOMES */}
              <div className="space-y-4 border-t border-white/5 pt-6">
                <label className="font-bold block text-sm uppercase tracking-tight text-gray-300">Máximo de nomes na roda</label>
                <p className="text-[11px] text-gray-400 leading-tight">
                  Todos os nomes na caixa de texto têm a mesma chance de ganhar, independentemente desse valor.
                </p>
                <input 
                  type="range" min="4" max="1000" 
                  className="w-full h-1 bg-blue-600 rounded-lg appearance-none cursor-pointer" 
                  value={settings.maxNames} 
                  onChange={(e) => setSettings({...settings, maxNames: parseInt(e.target.value)})} 
                />
                <div className="flex justify-between text-[9px] text-gray-500 font-bold">
                  {[4, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000].map(v => <span key={v}>{v}</span>)}
                </div>
              </div>
            </div>
          )}

          {/* --- ABA: DEPOIS DO GIRO --- */}
          {activeTab === 'after' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex items-center gap-4">
                <label className="w-32 font-medium text-gray-300">Som</label>
                <select 
                  className="flex-1 bg-[#2d2d2d] border border-white/10 p-2 rounded outline-none" 
                  value={settings.afterSpinSound} 
                  onChange={(e) => setSettings({...settings, afterSpinSound: e.target.value})}
                >
                  <option>Aplausos moderados</option>
                  <option>Fanfarra</option>
                  <option>Nenhum</option>
                </select>
                <div className="flex gap-2">
                  <Play size={18} className="text-gray-400 cursor-pointer hover:text-white"/>
                  <Square size={18} className="text-gray-400 cursor-pointer hover:text-white"/>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block font-medium text-gray-300">Volume</label>
                <input 
                  type="range" 
                  className="w-full h-1 bg-blue-600 rounded-lg appearance-none cursor-pointer" 
                  value={settings.afterSpinVolume} 
                  onChange={(e) => setSettings({...settings, afterSpinVolume: parseInt(e.target.value)})} 
                />
              </div>

              <div className="space-y-4 border-t border-white/5 pt-6">
                <div className="flex gap-8">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={settings.animateWinner} onChange={() => setSettings({...settings, animateWinner: !settings.animateWinner})} className="w-4 h-4 rounded border-gray-700 bg-blue-600" />
                    Animar a entrada vencedora
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={settings.launchConfetti} onChange={() => setSettings({...settings, launchConfetti: !settings.launchConfetti})} className="w-4 h-4 rounded border-gray-700 bg-blue-600" />
                    Lançamento de confete
                  </label>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={settings.autoRemoveWinner} onChange={() => setSettings({...settings, autoRemoveWinner: !settings.autoRemoveWinner})} className="w-4 h-4 rounded border-gray-700 bg-blue-600" />
                  Remover vencedor automaticamente após 5 segundos
                </label>
              </div>

              <div className="space-y-4 border-t border-white/5 pt-6">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-3 cursor-pointer whitespace-nowrap">
                    <input type="checkbox" checked={settings.showWinnerPopup} onChange={() => setSettings({...settings, showWinnerPopup: !settings.showWinnerPopup})} className="w-4 h-4 rounded border-gray-700 bg-blue-600" />
                    Exibir uma janela pop-up com esta mensagem:
                  </label>
                  <input 
                    type="text" 
                    className="flex-1 bg-[#2d2d2d] border border-white/10 p-2 rounded outline-none text-gray-300"
                    value={settings.winnerMessage}
                    onChange={(e) => setSettings({...settings, winnerMessage: e.target.value})}
                  />
                </div>
                <div className="ml-7 flex flex-col gap-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={settings.showRemoveButton} onChange={() => setSettings({...settings, showRemoveButton: !settings.showRemoveButton})} className="w-4 h-4 rounded border-gray-700 bg-blue-600" />
                    Exibir o botão "Remover"
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer border-t border-white/5 pt-4">
                    <input type="checkbox" checked={settings.playClickOnRemove} onChange={() => setSettings({...settings, playClickOnRemove: !settings.playClickOnRemove})} className="w-4 h-4 rounded border-gray-700 bg-blue-600" />
                    Tocar um clique quando o vencedor for removido
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RODAPÉ */}
        <div className="p-4 bg-[#252526] flex justify-end gap-2 border-t border-white/5">
          <button onClick={onClose} className="px-6 py-2 font-bold uppercase hover:bg-white/5 rounded text-gray-400 transition-colors">Cancelar</button>
          <button onClick={onClose} className="px-10 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded uppercase transition-all shadow-lg active:scale-95">OK</button>
        </div>
      </div>
    </div>
  );
}