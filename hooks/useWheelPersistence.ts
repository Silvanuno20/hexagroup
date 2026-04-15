"use client";
import { useState, useEffect, useMemo } from 'react';

export interface WheelEntry {
  nome: string;
  quantidade: number;
}

export function useWheelPersistence() {
  const [rawText, setRawText] = useState("Beatriz, 1\nEric, 1\nGabriel, 1\nAli, 1\nCharles, 1\nDiya, 1\nFatima, 1\nHanna, 1");
  const [results, setResults] = useState<string[]>([]);

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

  useEffect(() => {
    localStorage.setItem('won_raw_text', rawText);
    localStorage.setItem('won_results', JSON.stringify(results));
  }, [rawText, results]);

  const parsedEntries = useMemo((): WheelEntry[] => {
    return rawText
      .split('\n')
      .filter(line => line.trim() !== "")
      .map(line => {
        const [nome, qtd] = line.split(',');
        return {
          nome: nome.trim(),
          quantidade: qtd ? parseInt(qtd.trim()) || 1 : 1
        };
      });
  }, [rawText]);

  return { 
    rawText, 
    setRawText, 
    results, 
    setResults, 
    parsedEntries 
  };
}