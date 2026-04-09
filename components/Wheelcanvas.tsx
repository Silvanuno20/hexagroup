"use client";
import React, { useEffect, useRef, useCallback } from 'react';

const COLORS = ['#3369E8', '#D50F25', '#EEB211', '#009925', '#9370db', '#ff8c00'];

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

    displayEntries.forEach((text, i) => {
      const angle = currentAngle.current + i * arc;
      ctx.beginPath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, angle, angle + arc);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.2)";
      ctx.lineWidth = 2;
      ctx.stroke();

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
    
    ctx.beginPath();
    ctx.arc(center, center, 40, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.shadowBlur = 15;
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.fill();
    ctx.shadowBlur = 0;
  }, [entries, settings.maxNames]);

  useEffect(() => { draw(); }, [draw, entries]);

  const animate = useCallback(() => {
    const friction = 1 - (1 / ((settings.spinTime || 10) * 60));
    
    if (angularVelocity.current > 0.0005) {
      angularVelocity.current *= friction;
      currentAngle.current += angularVelocity.current;

      const displayCount = Math.min(entries.length, settings.maxNames || 1000);
      const arc = (2 * Math.PI) / displayCount;
      const currentTick = Math.floor((currentAngle.current % (Math.PI * 2)) / arc);
      
      if (currentTick !== lastTickIndex.current) {
        if (audioRef.current) {
          const vol = parseFloat(settings.volume);
          const safeVolume = isFinite(vol) ? Math.max(0, Math.min(1, vol / 100)) : 0.5;
          audioRef.current.volume = safeVolume;
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {});
        }
        lastTickIndex.current = currentTick;
      }
      draw();
      requestRef.current = requestAnimationFrame(animate);
    } else {
      setIsSpinning(false);
      const displayCount = Math.min(entries.length, settings.maxNames || 1000);
      const arc = (2 * Math.PI) / displayCount;
      const normalizedAngle = (2 * Math.PI - (currentAngle.current % (2 * Math.PI))) % (2 * Math.PI);
      const index = Math.floor(normalizedAngle / arc);
      if (entries[index]) onWinner(entries[index]);
    }
  }, [entries, settings, draw, onWinner, setIsSpinning]);

  const spin = () => {
    if (entries.length < 2 || angularVelocity.current > 0) return;
    setIsSpinning(true);
    const baseSpeed = settings.spinSlowly ? 0.12 : 0.45;
    angularVelocity.current = Math.random() * 0.3 + baseSpeed;
    if (requestRef.current !== null) cancelAnimationFrame(requestRef.current);
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => { if (requestRef.current !== null) cancelAnimationFrame(requestRef.current); };
  }, []);

  return (
    <div className="relative cursor-pointer select-none group" onClick={spin}>
      <div className="absolute -right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white shadow-xl flex items-center justify-center" 
           style={{ clipPath: 'polygon(100% 50%, 0 0, 20% 50%, 0 100%)' }} />
      <canvas ref={canvasRef} width={600} height={600} className="max-w-full h-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]" />
    </div>
  );
}