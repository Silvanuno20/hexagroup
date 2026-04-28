"use client";
import React, { useEffect, useRef, useCallback, useMemo } from 'react';

const COLORS = ['#3c3c3b', '#016450', '#4b3f72', '#1a4d9b', '#51869e'];

interface Entry {
  nome: string;
  quantidade: number;
  probabilidade: number;
}

interface WheelProps {
  entries: Entry[];
  settings: {
    volume: number;
    spinTime: number;
    probMode: string;
    isMuted: boolean; // Campo essencial para o modo silencioso
  };
  onWinner: (name: string, probability: number) => void;
  setIsSpinning: (state: boolean) => void;
  onStockDecrease: (nome: string) => void;
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

  const activeEntries = entries.filter((e) => e.quantidade > 0);

  const totalWeight = useMemo(() => {
    if (settings.probMode === 'manual') {
      return activeEntries.reduce((acc, cur) => acc + (Number(cur.probabilidade) || 0), 0);
    }
    return activeEntries.reduce((acc, cur) => acc + (Number(cur.quantidade) || 0), 0);
  }, [activeEntries, settings.probMode]);

  const getSlices = useCallback(() => {
    if (activeEntries.length === 0) return [];
    const sliceAngle = (Math.PI * 2) / activeEntries.length;
    
    return activeEntries.map((entry, index) => {
      const startAngle = index * sliceAngle;
      return { entry, startAngle, sliceAngle };
    });
  }, [activeEntries]);

  useEffect(() => {
    audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
  }, []);

  const playTick = useCallback(() => {
    const ctx = audioCtxRef.current;
    
    // VERIFICAÇÃO DO MODO SILENCIOSO
    if (!ctx || ctx.state === 'suspended' || settings.isMuted) return;

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
  }, [settings.volume, settings.isMuted]); // Dependências atualizadas

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

      ctx.beginPath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, start, end);
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();

      if (sliceAngle > 0.05) {
        const midAngle = start + sliceAngle / 2;
        ctx.save();
        ctx.translate(center + Math.cos(midAngle) * (radius * 0.65), center + Math.sin(midAngle) * (radius * 0.65));
        ctx.rotate(midAngle + Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillStyle = 'white';
        ctx.font = `bold ${activeEntries.length > 10 ? '12px' : '16px'} sans-serif`;
        ctx.fillText(entry.nome, 0, 0); 
        ctx.restore();
      }
    });

    ctx.beginPath();
    ctx.arc(center, center, 25, 0, 2 * Math.PI);
    ctx.fillStyle = '#1A1A1A';
    ctx.fill();
    ctx.strokeStyle = '#444';
    ctx.stroke();
  }, [activeEntries, getSlices]);

  useEffect(() => {
    draw();
  }, [draw]);

  const getIndexAtPointer = useCallback((): number => {
    const computed = getSlices();
    if (!computed.length) return -1;
    let pointerAngle = ((-currentAngle.current) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
    return computed.findIndex(s => pointerAngle >= s.startAngle && pointerAngle < (s.startAngle + s.sliceAngle));
  }, [getSlices]);

  const animate = useCallback(() => {
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
      angularVelocity.current = 0;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      setIsSpinning(false);

      const idx = getIndexAtPointer();
      const computed = getSlices();
      if (computed[idx]) {
        const winner = computed[idx].entry;
        onStockDecrease(winner.nome);
        const currentWeight = settings.probMode === 'manual' ? winner.probabilidade : winner.quantidade;
        const winnerProb = (currentWeight / totalWeight) * 100;
        onWinner(winner.nome, winnerProb);
      }
    }
  }, [draw, getIndexAtPointer, getSlices, totalWeight, playTick, onWinner, onStockDecrease, setIsSpinning, settings.spinTime, settings.probMode]);

  const spin = () => {
    if (activeEntries.length < 1 || angularVelocity.current > 0) return;
    if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();

    setIsSpinning(true);
    lastTickIndex.current = -1;

    let selectedIndex = 0;

    const guaranteed = settings.probMode === 'manual' 
      ? activeEntries.find(e => e.probabilidade >= 100)
      : null;

    if (guaranteed) {
      selectedIndex = activeEntries.indexOf(guaranteed);
    } else {
      let rand = Math.random() * totalWeight;
      for (let i = 0; i < activeEntries.length; i++) {
        const weight = settings.probMode === 'manual' 
          ? activeEntries[i].probabilidade 
          : activeEntries[i].quantidade;

        if (rand < weight) {
          selectedIndex = i;
          break;
        }
        rand -= weight;
      }
    }

    currentAngle.current = currentAngle.current % (Math.PI * 2);
    angularVelocity.current = 0.3 + (Math.random() * 0.2); 
    requestRef.current = requestAnimationFrame(animate);
  };

  return (
    <div className="relative inline-block" style={{ filter: 'drop-shadow(0px 10px 30px rgba(0,0,0,0.5))' }}>
      <div
        className="absolute right-[0px] top-1/2 -translate-y-1/2 z-40"
        style={{
          width: '30px',
          height: '40px',
          backgroundColor: '#ff1744',
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