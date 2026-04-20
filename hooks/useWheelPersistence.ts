"use client";
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/hooks/supabaseClient'; // Certifica-te que o caminho está correto

export interface WheelEntry {
  nome: string;
  quantidade: number;
}

export interface SavedWheel {
  id: string;
  name: string;
  segments: { label: string; weight: number; color?: string }[];
  created_at: string;
  updated_at: string;
}

export function useWheelPersistence() {
  const [rawText, setRawText] = useState("Beatriz, 1\nEric, 1\nGabriel, 1\nAli, 1\nCharles, 1\nDiya, 1\nFatima, 1\nHanna, 1");
  const [results, setResults] = useState<string[]>([]);
  // Novos estados para suportar a base de dados
  const [currentWheelId, setCurrentWheelId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Carregar do localStorage (inclui o ID da roda atual, se existir)
  useEffect(() => {
    const savedText = localStorage.getItem('won_raw_text');
    const savedResults = localStorage.getItem('won_results');
    const savedWheelId = localStorage.getItem('won_current_wheel_id');
    if (savedText) setRawText(savedText);
    if (savedResults) {
      try {
        setResults(JSON.parse(savedResults));
      } catch (e) {
        setResults([]);
      }
    }
    if (savedWheelId) setCurrentWheelId(savedWheelId);
  }, []);

  // Persistir no localStorage (inclui o ID da roda)
  useEffect(() => {
    localStorage.setItem('won_raw_text', rawText);
    localStorage.setItem('won_results', JSON.stringify(results));
    if (currentWheelId) {
      localStorage.setItem('won_current_wheel_id', currentWheelId);
    } else {
      localStorage.removeItem('won_current_wheel_id');
    }
  }, [rawText, results, currentWheelId]);

  const parsedEntries = useMemo((): WheelEntry[] => {
    return rawText
      .split('\n')
      .filter(line => line.trim() !== "")
      .map(line => {
        const [nome, qtd] = line.split(',');
        const quantidade = qtd ? parseInt(qtd.trim()) : 1;
        return {
          nome: nome.trim(),
          quantidade: quantidade > 0 ? quantidade : 0
        };
      })
      .filter(entry => entry.quantidade > 0);
  }, [rawText]);

  // Converte parsedEntries para o formato segments do Supabase
  const segmentsFromEntries = useMemo(() => {
    return parsedEntries.map(entry => ({
      label: entry.nome,
      weight: entry.quantidade,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`
    }));
  }, [parsedEntries]);

  // ---- NOVAS FUNÇÕES PARA A BASE DE DADOS ----

  // Guardar a roda atual no Supabase (cria ou atualiza)
  const saveToSupabase = async (wheelName: string) => {
    setLoading(true);
    try {
      if (currentWheelId) {
        // Atualizar roda existente
        const { error } = await supabase
          .from('wheels')
          .update({
            name: wheelName,
            segments: segmentsFromEntries,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentWheelId);
        if (error) throw error;
      } else {
        // Criar nova roda
        const { data, error } = await supabase
          .from('wheels')
          .insert({
            name: wheelName,
            segments: segmentsFromEntries,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        if (error) throw error;
        setCurrentWheelId(data.id);
      }
    } catch (err) {
      console.error('Erro ao guardar no Supabase:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Carregar uma roda específica do Supabase pelo ID
  const loadFromSupabase = async (wheelId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('wheels')
        .select('*')
        .eq('id', wheelId)
        .single();
      if (error) throw error;
      if (data) {
        // Converter segments de volta para rawText (formato "nome, quantidade")
        const newRawText = data.segments
          .map((seg: any) => `${seg.label}, ${seg.weight || 1}`)
          .join('\n');
        setRawText(newRawText);
        setCurrentWheelId(data.id);
        setResults([]); // Opcional: podes carregar o histórico depois
      }
    } catch (err) {
      console.error('Erro ao carregar do Supabase:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Listar todas as rodas do Supabase (para usar no modal Open)
  const listWheels = async (): Promise<SavedWheel[]> => {
    const { data, error } = await supabase
      .from('wheels')
      .select('id, name, segments, created_at, updated_at')
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data || [];
  };

  // Adicionar um resultado ao histórico (local + Supabase)
  const addResult = async (result: string) => {
    const newResults = [...results, result];
    setResults(newResults);
    if (currentWheelId) {
      await supabase.from('spin_history').insert({
        wheel_id: currentWheelId,
        result: result,
        spun_at: new Date().toISOString()
      });
    }
  };

  // Limpar o histórico de resultados (local)
  const clearResults = () => setResults([]);

  // Retorna tudo o que já existia + as novas funções
  return { 
    rawText, 
    setRawText, 
    results, 
    setResults, 
    parsedEntries,
    currentWheelId,
    loading,
    saveToSupabase,
    loadFromSupabase,
    listWheels,
    addResult,
    clearResults
  };
}