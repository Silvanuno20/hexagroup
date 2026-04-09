"use client";
import React, { useState } from 'react';
import { Pencil, Palette, Settings, Link as LinkIcon, Check, Copy } from 'lucide-react';

interface ShareModalProps {
  onClose: () => void;
  wheelTitle: string;
}

type Step = 'Share' | 'Theme' | 'Visibility' | 'Link';

export default function ShareModal({ onClose, wheelTitle }: ShareModalProps) {
  const [step, setStep] = useState<Step>('Share');
  const [copied, setCopied] = useState(false);

  const steps = [
    { id: 'Share', label: 'Compartilhar', icon: <Pencil size={14} /> },
    { id: 'Theme', label: 'Theme', icon: <Palette size={14} /> },
    { id: 'Visibility', label: 'Visibilidade', icon: <Settings size={14} /> },
    { id: 'Link', label: 'Ligação', icon: <LinkIcon size={14} /> },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText("https://wheelofnames.com/pt/rrq-r57");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#1e1e1e] w-full max-w-xl rounded-xl shadow-2xl border border-white/10 overflow-hidden text-white">
        
        {/* STEPPER HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          {steps.map((s, idx) => (
            <React.Fragment key={s.id}>
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  step === s.id ? 'bg-blue-600' : 'bg-blue-600/20 text-blue-500'
                }`}>
                  {steps.findIndex(x => x.id === step) > idx ? <Check size={12}/> : s.icon}
                </div>
                <span className={`text-xs font-medium ${step === s.id ? 'text-blue-500' : 'text-gray-500'}`}>
                  {s.label}
                </span>
              </div>
              {idx < steps.length - 1 && <div className="h-px w-8 bg-white/10" />}
            </React.Fragment>
          ))}
        </div>

        {/* CONTEÚDO DINÂMICO */}
        <div className="p-8 min-h-[300px]">
          {step === 'Share' && (
            <div className="space-y-6">
              <p className="text-[15px] leading-relaxed text-gray-200">Se você continuar, criará um link público para sua roda atual...</p>
              <p className="text-[15px] leading-relaxed text-gray-200">Este link funcionará para qualquer pessoa... Links não utilizados serão excluídos após 365 dias.</p>
              <button className="text-blue-500 hover:underline text-sm font-medium">Termos de serviço</button>
            </div>
          )}

          {step === 'Theme' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold">Aplicar tema</h3>
              <div className="grid grid-cols-2 gap-4">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className={`p-4 rounded-lg border transition-all cursor-pointer ${i === 0 ? 'border-blue-500 bg-blue-500/5' : 'border-white/5 bg-white/5 hover:bg-white/10'}`}>
                    <div className="aspect-square bg-gray-800 rounded-full mb-3 flex items-center justify-center" />
                    <p className="text-center text-xs font-medium text-gray-400">{i === 0 ? 'Tema de cores atual' : `Tema de cores ${i}`}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 'Visibility' && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Atualizar a sua roda partilhada existente?</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-blue-600 flex items-center justify-center"><div className="w-2.5 h-2.5 bg-blue-600 rounded-full" /></div>
                  <span className="text-sm">Atualizar minha roda em https://wheelofnames.com/rrq-r57</span>
                </div>
                <div className="mt-6">
                   <label className="text-xs text-gray-500 font-bold uppercase">Título da roda</label>
                   <input type="text" defaultValue={wheelTitle} className="w-full bg-[#2d2d2d] border border-white/10 rounded p-2 mt-1 text-sm outline-none focus:border-blue-500" />
                </div>
              </div>
            </div>
          )}

          {step === 'Link' && (
            <div className="space-y-6">
              <p className="text-sm font-medium text-gray-300">Link para esta roda com nomes, cores e configurações:</p>
              <div className="flex gap-2">
                <input readOnly value="https://wheelofnames.com/pt/rrq-r57" className="flex-1 bg-[#2d2d2d] border border-white/10 rounded p-3 text-sm font-mono text-gray-400"/>
                <button onClick={handleCopy} className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded font-bold text-sm flex items-center gap-2 transition-colors">
                  <Copy size={16}/> {copied ? 'Copiado!' : 'Copiar link'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RODAPÉ */}
        <div className="p-4 bg-black/20 flex justify-end gap-3 border-t border-white/5">
          <button onClick={onClose} className="px-6 py-2 text-sm font-bold hover:bg-white/5 rounded transition-colors">
            {step === 'Link' ? 'Fechar' : 'Cancelar'}
          </button>
          {step !== 'Link' && (
            <button 
              onClick={() => {
                if (step === 'Share') setStep('Theme');
                else if (step === 'Theme') setStep('Visibility');
                else if (step === 'Visibility') setStep('Link');
              }}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-bold transition-all"
            >
              Continuar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}