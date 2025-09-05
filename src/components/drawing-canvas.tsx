"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

export default function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;

    const context = canvas.getContext('2d');
    if (!context) return;
    
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    context.scale(dpr, dpr);
    context.lineCap = 'round';
    context.strokeStyle = 'white';
    context.lineWidth = 3;
    contextRef.current = context;
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [resizeCanvas]);

  const getCoordinates = (event: MouseEvent | Touch) => {
    const canvas = canvasRef.current;
    if (!canvas) return { offsetX: 0, offsetY: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width / (window.devicePixelRatio || 1);
    const scaleY = canvas.height / rect.height / (window.devicePixelRatio || 1);
    
    const clientX = event.clientX;
    const clientY = event.clientY;

    return { 
      offsetX: (clientX - rect.left) * scaleX, 
      offsetY: (clientY - rect.top) * scaleY 
    };
  }

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    const nativeEvent = "nativeEvent" in event ? event.nativeEvent : event;
    const { offsetX, offsetY } = getCoordinates('touches' in nativeEvent ? nativeEvent.touches[0] : nativeEvent as MouseEvent);
    contextRef.current?.beginPath();
    contextRef.current?.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const finishDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    contextRef.current?.closePath();
    setIsDrawing(false);
  };

  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    if (!isDrawing) return;
    
    const nativeEvent = "nativeEvent" in event ? event.nativeEvent : event;
    const { offsetX, offsetY } = getCoordinates('touches' in nativeEvent ? nativeEvent.touches[0] : nativeEvent as MouseEvent);
    contextRef.current?.lineTo(offsetX, offsetY);
    contextRef.current?.stroke();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div className="w-full h-full bg-black/70 backdrop-blur-sm rounded-xl border border-white/10 relative overflow-hidden shadow-inner">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseUp={finishDrawing}
        onMouseMove={draw}
        onMouseLeave={finishDrawing}
        onTouchStart={startDrawing}
        onTouchEnd={finishDrawing}
        onTouchMove={draw}
        style={{ touchAction: 'none' }}
        className="w-full h-full cursor-crosshair"
      />
      <div className="absolute top-4 right-4">
        <Button variant="destructive" size="icon" onClick={clearCanvas} aria-label="Clear canvas">
          <Trash2 className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
