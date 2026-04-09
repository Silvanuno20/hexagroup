"use client";
import { useState, useEffect } from 'react';

export function useWheelPersistence() {
  const [rawText, setRawText] = useState("Beatriz\nEric\nGabriel\nAli\nCharles\nDiya\nFatima\nHanna");
  const [results, setResults] = useState<string[]>([]);

  // Carregar dados ao iniciar
  useEffect(() => {
    const savedText = localStorage.getItem('won_raw_text');
    const savedResults = localStorage.getItem('won_results');
    if (savedText) setRawText(savedText);
    if (savedResults) {
      try {
        setResults(JSON.parse(savedResults));
      } catch (e) {
        setResults([]);
      }
    }
  }, []);

  // Salvar sempre que houver mudança
  useEffect(() => {
    localStorage.setItem('won_raw_text', rawText);
    localStorage.setItem('won_results', JSON.stringify(results));
  }, [rawText, results]);

  return { rawText, setRawText, results, setResults };
}