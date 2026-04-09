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
    const radius = center - 10;
    
    // Aplica o limite de nomes visualmente
    const displayEntries = entries.slice(0, settings.maxNames);
    const arc = (2 * Math.PI) / displayEntries.length;

    ctx.clearRect(0, 0, size, size);

    displayEntries.forEach((text, i) => {
      const angle = currentAngle.current + i * arc;
      ctx.beginPath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, angle, angle + arc);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.stroke();

      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "white";
      const fontSize = displayEntries.length > 50 ? 10 : displayEntries.length > 20 ? 13 : 16;
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillText(text.length > 15 ? text.substring(0, 12) + "..." : text, radius - 25, 5);
      ctx.restore();
    });
    
    ctx.beginPath();
    ctx.arc(center, center, 45, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
  }, [entries, settings.maxNames]);

  useEffect(() => { draw(); }, [draw, entries]);

  const animate = () => {
    const friction = 1 - (1 / (settings.spinTime * 60));
    if (angularVelocity.current > 0.0008) {
      angularVelocity.current *= friction;
      currentAngle.current += angularVelocity.current;

      const displayCount = Math.min(entries.length, settings.maxNames);
      const arc = (2 * Math.PI) / displayCount;
      const currentTick = Math.floor((currentAngle.current % (Math.PI * 2)) / arc);
      
      if (currentTick !== lastTickIndex.current) {
        if (audioRef.current) {
          audioRef.current.volume = settings.volume / 100;
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {});
        }
        lastTickIndex.current = currentTick;
      }
      draw();
      requestAnimationFrame(animate);
    } else {
      setIsSpinning(false);
      const displayCount = Math.min(entries.length, settings.maxNames);
      const arc = (2 * Math.PI) / displayCount;
      const normalizedAngle = (2 * Math.PI - (currentAngle.current % (2 * Math.PI))) % (2 * Math.PI);
      const index = Math.floor(normalizedAngle / arc);
      onWinner(entries[index]);
    }
  };

  const spin = () => {
    if (entries.length < 2) return;
    setIsSpinning(true);
    const baseSpeed = settings.spinSlowly ? 0.15 : 0.5;
    angularVelocity.current = Math.random() * 0.25 + baseSpeed;
    animate();
  };

  return (
    <div className="relative cursor-pointer select-none" onClick={spin}>
      <div className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-blue-500" 
           style={{ clipPath: 'polygon(100% 50%, 0 0, 0 100%)' }} />
      <canvas ref={canvasRef} width={600} height={600} className="max-w-full h-auto drop-shadow-2xl" />
    </div>
  );
}