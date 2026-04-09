"use client";
import React from 'react';
import { X, Copy, Link as LinkIcon, Share2 } from 'lucide-react';

interface ShareModalProps {
  lang: 'pt' | 'en';
  onClose: () => void;
}

const translations = {
  pt: {
    title: "Compartilhar",
    copyBtn: "Copiar Link",
    copied: "Copiado para a área de transferência!",
    desc: "Qualquer pessoa com este link poderá ver a sua roda.",
    close: "Fechar"
  },
  en: {
    title: "Share",
    copyBtn: "Copy Link",
    copied: "Copied to clipboard!",
    desc: "Anyone with this link will be able to see your wheel.",
    close: "Close"
  }
};

export default function ShareModal({ lang, onClose }: ShareModalProps) {
  const t = translations[lang];
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    alert(t.copied);
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1e1e1e] w-full max-w-md rounded-[32px] border border-white/10 shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-[#252526]">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Share2 className="text-blue-500" size={22} /> {t.title}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400"><X size={20} /></button>
        </div>

        <div className="p-8 flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500">
            <LinkIcon size={40} />
          </div>
          
          <div className="space-y-2 w-full">
            <p className="text-sm text-gray-400">{t.desc}</p>
            <div className="flex gap-2 mt-4">
              <input 
                type="text" readOnly value={shareUrl}
                className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-xs text-gray-500 outline-none"
              />
              <button 
                onClick={handleCopy}
                className="bg-blue-600 hover:bg-blue-500 p-3 rounded-xl transition-all"
              >
                <Copy size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-[#181819] flex justify-end">
          <button onClick={onClose} className="text-sm font-bold text-gray-400 hover:text-white">{t.close}</button>
        </div>
      </div>
    </div>
  );
}