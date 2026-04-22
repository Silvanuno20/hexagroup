"use client";
import React, { useEffect, useRef, useCallback } from 'react';

// Cores vibrantes para as fatias
const COLORS = ['#FF3D00', '#3D5AFE', '#00E676', '#D500F9', '#FFFF00', '#00E5FF', '#FF1744', '#1DE9B6'];

interface Entry {
  nome: string;
  quantidade: number;   // Este é o STOCK (se chegar a 0, sai da roleta)
  probabilidade: number; // Este é o CONTROLO MANUAL (tamanho da fatia e chance)
}

interface WheelProps {
  entries: Entry[];
  settings: {
    volume: number;
    spinTime: number;
  };
  onWinner: (name: string, probability: number) => void;
  setIsSpinning: (state: boolean) => void;
  onStockDecrease: (nome: string) => void; // Função que atualiza o stock no teu estado/DB
}

export default function WheelCanvas({
  entries,
  settings,
  onWinner,
  setIsSpinning,
  onStockDecrease,
}: WheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const angularVelocity = useRef(0);
  const currentAngle = useRef(0);
  const lastTickIndex = useRef(-1);
  const requestRef = useRef<number | null>(null);

  // 1. FILTRAGEM: Apenas itens com stock > 0 participam
  const activeEntries = entries.filter((e) => e.quantidade > 0);
  
  // 2. SOMA DAS PROBABILIDADES MANUAIS (para normalizar o círculo em 100% ou no total definido)
  const totalProb = activeEntries.reduce((acc, cur) => acc + (Number(cur.probabilidade) || 0), 0);

  // 3. CÁLCULO DAS FATIAS: Baseado estritamente na probabilidade manual
  const getSlices = useCallback(() => {
    if (totalProb <= 0) return [];
    let cumulative = 0;
    return activeEntries.map((entry) => {
      const fraction = entry.probabilidade / totalProb;
      const startAngle = cumulative * Math.PI * 2;
      const sliceAngle = fraction * Math.PI * 2;
      cumulative += fraction;
      return { entry, startAngle, sliceAngle };
    });
  }, [activeEntries, totalProb]);

  useEffect(() => {
    audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
  }, []);

  const playTick = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx || ctx.state === 'suspended') return;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(600 + Math.random() * 200, ctx.currentTime);
    gain.gain.setValueAtTime(settings.volume / 100, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.1);
  }, [settings.volume]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || activeEntries.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 10;

    ctx.clearRect(0, 0, size, size);
    const computedSlices = getSlices();

    computedSlices.forEach(({ entry, startAngle, sliceAngle }, i) => {
      const rotated = currentAngle.current;
      const start = startAngle + rotated;
      const end = start + sliceAngle;

      // Desenho da Fatia
      ctx.beginPath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, start, end);
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Texto dentro da Fatia
      if (sliceAngle > 0.1) { // Só desenha se a fatia não for minúscula
        const midAngle = start + sliceAngle / 2;
        ctx.save();
        ctx.translate(center + Math.cos(midAngle) * (radius * 0.65), center + Math.sin(midAngle) * (radius * 0.65));
        ctx.rotate(midAngle + Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillStyle = 'white';
        ctx.font = `bold ${sliceAngle > 0.3 ? '16px' : '12px'} sans-serif`;
        ctx.fillText(entry.nome, 0, 0);
        
        // Exibe a chance real em %
        const percent = ((entry.probabilidade / totalProb) * 100).toFixed(0) + '%';
        ctx.font = '10px sans-serif';
        ctx.fillText(percent, 0, 15);
        ctx.restore();
      }
    });

    // Círculo central (Eixo)
    ctx.beginPath();
    ctx.arc(center, center, 25, 0, 2 * Math.PI);
    ctx.fillStyle = '#1A1A1A';
    ctx.fill();
    ctx.strokeStyle = '#444';
    ctx.stroke();
  }, [activeEntries, getSlices, totalProb]);

  useEffect(() => {
    draw();
  }, [draw]);

  const getIndexAtPointer = useCallback((): number => {
    const computed = getSlices();
    if (!computed.length) return -1;
    // O ponteiro está à direita (ângulo 0). Normalizamos a rotação.
    let pointerAngle = ((-currentAngle.current) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
    return computed.findIndex(s => pointerAngle >= s.startAngle && pointerAngle < (s.startAngle + s.sliceAngle));
  }, [getSlices]);

  const animate = useCallback(() => {
    // Atrito baseado no tempo definido nas settings
    const friction = 0.98 + (settings.spinTime / 5000); 

    if (angularVelocity.current > 0.0005) {
      angularVelocity.current *= friction;
      currentAngle.current += angularVelocity.current;

      const idx = getIndexAtPointer();
      if (idx !== lastTickIndex.current) {
        lastTickIndex.current = idx;
        playTick();
      }

      draw();
      requestRef.current = requestAnimationFrame(animate);
    } else {
      // PARAGEM DA ROLETA
      angularVelocity.current = 0;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      setIsSpinning(false);

      const idx = getIndexAtPointer();
      const computed = getSlices();
      if (computed[idx]) {
        const winner = computed[idx].entry;
        
        // ── DIMINUI O STOCK AUTOMATICAMENTE ──
        onStockDecrease(winner.nome);

        // Dispara o evento de vencedor para o componente pai
        const winnerProb = (winner.probabilidade / totalProb) * 100;
        onWinner(winner.nome, winnerProb);
      }
    }
  }, [draw, getIndexAtPointer, getSlices, totalProb, playTick, onWinner, onStockDecrease, setIsSpinning, settings.spinTime]);

  const spin = () => {
    if (activeEntries.length < 1 || angularVelocity.current > 0) return;
    
    // Resume áudio se o browser bloqueou
    if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();

    setIsSpinning(true);
    lastTickIndex.current = -1;

    // SORTEIO PONDERADO (Manual)
    let rand = Math.random() * totalProb;
    let selectedIndex = 0;
    for (let i = 0; i < activeEntries.length; i++) {
      if (rand < activeEntries[i].probabilidade) {
        selectedIndex = i;
        break;
      }
      rand -= activeEntries[i].probabilidade;
    }

    // Cálculo para garantir que a roleta pare visualmente no item sorteado
    const computed = getSlices();
    const target = computed[selectedIndex];
    const midOfSlice = target.startAngle + target.sliceAngle / 2;
    const extraSpins = Math.PI * 2 * (10 + Math.random() * 5); // 10 a 15 voltas
    
    // Força inicial necessária para a animação
    angularVelocity.current = 0.3 + (Math.random() * 0.2); 

    requestRef.current = requestAnimationFrame(animate);
  };

  return (
    <div className="relative inline-block" style={{ filter: 'drop-shadow(0px 10px 30px rgba(0,0,0,0.5))' }}>
      {/* Seta Indicadora (Pointer) */}
      <div
        className="absolute right-[0px] top-1/2 -translate-y-1/2 z-40"
          style={{
            width: '30px',
            height: '40px',
            backgroundColor: '#ff1744',
            // Clip-path invertido para a ponta ficar para a esquerda (dentro)
            clipPath: 'polygon(0% 50%, 100% 0%, 100% 100%)', 
            borderLeft: '2px solid white'
        }}
      />
      
      <canvas
        ref={canvasRef}
        width={600}
        height={600}
        onClick={spin}
        className="max-w-full h-auto cursor-pointer"
      />
    </div>
  );
}