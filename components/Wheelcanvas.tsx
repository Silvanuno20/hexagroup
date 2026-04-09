"use client";
import React, { useEffect, useRef, useCallback } from 'react';

const COLORS = ['#FF3D00', '#3D5AFE', '#00E676', '#D500F9', '#FFFF00', '#00E5FF'];

interface WheelProps {
  entries: string[];
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
    
    const displayEntries = entries.slice(0, settings.maxNames || 1000);
    const arc = (2 * Math.PI) / displayEntries.length;

    ctx.clearRect(0, 0, size, size);

    // 1. Desenhar Fatias
    displayEntries.forEach((text, i) => {
      const angle = currentAngle.current + i * arc;
      ctx.beginPath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, angle, angle + arc);
      ctx.fill();
      
      // Linha divisória sutil
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // 2. Desenhar Texto
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "white";
      const fontSize = displayEntries.length > 50 ? 10 : displayEntries.length > 20 ? 14 : 18;
      ctx.font = `bold ${fontSize}px sans-serif`;
      const displayText = text.length > 15 ? text.substring(0, 12) + "..." : text;
      ctx.fillText(displayText, radius - 30, fontSize / 3);
      ctx.restore();
    });

    // 3. Efeito de Sombra na Borda (Profundidade)
    const innerGradient = ctx.createRadialGradient(center, center, radius * 0.8, center, center, radius);
    innerGradient.addColorStop(0, 'rgba(0,0,0,0)');
    innerGradient.addColorStop(1, 'rgba(0,0,0,0.2)');
    ctx.fillStyle = innerGradient;
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // 4. Círculo Central (Eixo)
    ctx.beginPath();
    ctx.arc(center, center, 40, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.shadowBlur = 15;
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.fill();
    ctx.shadowBlur = 0;

    // Detalhe do botão central
    ctx.beginPath();
    ctx.arc(center, center, 35, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgba(0,0,0,0.05)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [entries, settings.maxNames]);

  useEffect(() => { draw(); }, [draw, entries]);

  const animate = useCallback(() => {
    // Fricção ajustada dinamicamente pelo tempo definido nas configurações
    const friction = 0.985 + (settings.spinTime / 1500); 
    
    if (angularVelocity.current > 0.0002) {
      angularVelocity.current *= friction;
      currentAngle.current += angularVelocity.current;

      const displayCount = Math.min(entries.length, settings.maxNames || 1000);
      const arc = (2 * Math.PI) / displayCount;
      
      // O ângulo "0" no Canvas é à direita (3 horas).
      // Calculamos o índice baseado no que está sob o ponteiro (que também está à direita).
      const currentTick = Math.floor(((currentAngle.current + arc / 2) % (Math.PI * 2)) / arc);
      
      if (currentTick !== lastTickIndex.current) {
        if (audioRef.current) {
          const vol = parseFloat(settings.volume);
          audioRef.current.volume = isFinite(vol) ? Math.max(0, Math.min(1, vol / 100)) : 0.5;
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {});
        }
        lastTickIndex.current = currentTick;
      }
      
      draw();
      requestRef.current = requestAnimationFrame(animate);
    } else {
      setIsSpinning(false);
      angularVelocity.current = 0;
      
      const displayCount = Math.min(entries.length, settings.maxNames || 1000);
      const arc = (2 * Math.PI) / displayCount;
      
      // Ajuste final para o vencedor (compensando a rotação do ponteiro à direita)
      const normalizedAngle = (2 * Math.PI - (currentAngle.current % (2 * Math.PI))) % (2 * Math.PI);
      const index = Math.floor(normalizedAngle / arc);
      
      if (entries[index]) onWinner(entries[index]);
    }
  }, [entries, settings, draw, onWinner, setIsSpinning]);

  const spin = () => {
    if (entries.length < 2 || angularVelocity.current > 0) return;
    
    setIsSpinning(true);
    // Velocidade baseada no tempo: quanto mais tempo, mais rápido começa para durar mais.
    const timeFactor = settings.spinTime / 10;
    const baseSpeed = settings.spinSlowly ? 0.1 : 0.4;
    angularVelocity.current = (Math.random() * 0.2) + (baseSpeed * timeFactor);
    
    if (requestRef.current !== null) cancelAnimationFrame(requestRef.current);
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => { if (requestRef.current !== null) cancelAnimationFrame(requestRef.current); };
  }, []);

  return (
    <div className="relative cursor-pointer select-none group" onClick={spin}>
      {/* Seta (Ponteiro) - Invertida para apontar para DENTRO da roda */}
      <div 
        className="absolute -right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-10 bg-white" 
        style={{ 
          clipPath: 'polygon(100% 0%, 0% 50%, 100% 100%)',
          filter: 'drop-shadow(-4px 0px 4px rgba(0,0,0,0.2))'
        }} 
      />
      
      {/* Glow de fundo quando a roda está parada */}
      {angularVelocity.current === 0 && (
        <div className="absolute inset-0 bg-blue-500/5 blur-[100px] rounded-full -z-10 animate-pulse" />
      )}
      
      <canvas 
        ref={canvasRef} 
        width={600} 
        height={600} 
        className="max-w-full h-auto drop-shadow-[0_25px_50px_rgba(0,0,0,0.5)] transition-transform duration-500" 
      />
    </div>
  );
}