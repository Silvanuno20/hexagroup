"use client";
import React, { useEffect, useRef, useCallback } from 'react';

const COLORS = ['#FF3D00', '#3D5AFE', '#00E676', '#D500F9', '#FFFF00', '#00E5FF'];

interface WheelProps {
  entries: { nome: string; quantidade: number }[];
  settings: any;
  onWinner: (name: string) => void;
  setIsSpinning: (state: boolean) => void;
}

export default function WheelCanvas({ entries, settings, onWinner, setIsSpinning }: WheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const angularVelocity = useRef(0);
  const currentAngle = useRef(0);
  const lastTickIndex = useRef(-1);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('/tick.mp3');
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || entries.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 20;
    const arc = (2 * Math.PI) / entries.length;

    ctx.clearRect(0, 0, size, size);

    entries.forEach((item, i) => {
      const angle = currentAngle.current + i * arc;
      ctx.beginPath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, angle, angle + arc);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.stroke();

      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "white";
      const fontSize = entries.length > 20 ? 12 : 18;
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillText(item.nome.substring(0, 15), radius - 30, fontSize / 3);
      ctx.restore();
    });

    // Círculo Central
    ctx.beginPath();
    ctx.arc(center, center, 40, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
  }, [entries]);

  useEffect(() => { draw(); }, [draw, entries]);

  const animate = useCallback(() => {
    const friction = 0.985 + (settings.spinTime / 1500);
    if (angularVelocity.current > 0.0005) {
      angularVelocity.current *= friction;
      currentAngle.current += angularVelocity.current;
      draw();
      requestRef.current = requestAnimationFrame(animate);
    } else {
      // RESET PARA PERMITIR NOVO GIRO
      angularVelocity.current = 0; 
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      
      setIsSpinning(false);
      const arc = (2 * Math.PI) / entries.length;
      const normalizedAngle = (2 * Math.PI - (currentAngle.current % (2 * Math.PI))) % (2 * Math.PI);
      const index = Math.floor(normalizedAngle / arc);
      if (entries[index]) onWinner(entries[index].nome);
    }
  }, [entries, settings, draw, onWinner, setIsSpinning]);

  const spin = () => {
    if (entries.length < 2 || angularVelocity.current > 0) return;
    setIsSpinning(true);

    // LÓGICA PONDERADA: O sorteio considera a quantidade para decidir o vencedor,
    // mas a roda continua com fatias iguais visualmente.
    const totalQtd = entries.reduce((acc, curr) => acc + curr.quantidade, 0);
    let random = Math.random() * totalQtd;
    let selectedIndex = 0;
    
    for (let i = 0; i < entries.length; i++) {
      if (random < entries[i].quantidade) { 
        selectedIndex = i; 
        break; 
      }
      random -= entries[i].quantidade;
    }

    const arc = (2 * Math.PI) / entries.length;
    const friction = 0.985 + (settings.spinTime / 1500);
    
    // Calcula o ângulo para cair exatamente na fatia do vencedor sorteado por peso
    const targetAngle = (2 * Math.PI) - (selectedIndex * arc) - (arc / 2);
    const extraVoltas = Math.PI * 2 * 10;
    
    angularVelocity.current = (extraVoltas + targetAngle - (currentAngle.current % (2 * Math.PI))) * (1 - friction);
    requestRef.current = requestAnimationFrame(animate);
  };

  return (
    <div className="relative cursor-pointer" onClick={spin}>
      <div className="absolute -right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-10 bg-white" style={{ clipPath: 'polygon(100% 0%, 0% 50%, 100% 100%)' }} />
      <canvas ref={canvasRef} width={600} height={600} className="max-w-full h-auto drop-shadow-2xl" />
    </div>
  );
}