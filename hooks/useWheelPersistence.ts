"use client";
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/hooks/supabaseClient';

export function useWheelPersistence() {
  const [rawText, setRawText] = useState("Opção 1, 1, 10\nOpção 2, 1, 10");
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Mapeamento dos dados para o formato JSON
  const segmentsFromEntries = useMemo(() => {
    return rawText.split('\n').filter(line => line.trim() !== "").map(line => {
      const [nome, qtd, prob] = line.split(',').map(s => s?.trim());
      return { 
        label: nome || "", 
        weight: parseInt(qtd) || 0, 
        prob: parseInt(prob) || 10,
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`
      };
    });
  }, [rawText]);

  // --- ADICIONADO: Função para gerenciar os vencedores ---
  const addResult = (nome: string) => {
    setResults(prev => [nome, ...prev]);
  };

  // FUNÇÃO SALVAR (Cria sempre um novo registro)
  const saveToSupabase = async (wheelName: string) => {
    setLoading(true);
    try {
      const payload = {
        nome: wheelName,
        dados: segmentsFromEntries,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('rodas')
        .insert([payload]);
      
      if (error) throw error;
      
      alert(`Projeto "${wheelName}" salvo com sucesso!`);
    } catch (err: any) {
      console.error('Erro ao salvar:', err.message);
      alert("Erro ao salvar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const listWheels = async () => {
    const { data, error } = await supabase
      .from('rodas')
      .select('id, nome, updated_at')
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(item => ({
      id: item.id,
      name: item.nome,
      updated_at: item.updated_at
    }));
  };

  const loadFromSupabase = async (wheelId: string) => {
    const { data, error } = await supabase
      .from('rodas')
      .select('*')
      .eq('id', wheelId)
      .single();

    if (error) throw error;
    if (data) {
      const text = data.dados.map((s: any) => `${s.label}, ${s.weight}, ${s.prob}`).join('\n');
      setRawText(text);
    }
  };

  // RETORNO ATUALIZADO COM addResult
  return { 
    rawText, setRawText, 
    results, setResults, addResult, // <--- addResult agora está disponível para o page.tsx
    loading, saveToSupabase, loadFromSupabase, listWheels 
  };
}