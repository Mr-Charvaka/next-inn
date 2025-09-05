"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Eraser, Pen, Square, Circle as CircleIcon, Type, Palette, Trash2, Redo, Undo } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

type Tool = 'pen' | 'eraser' | 'text' | 'rect' | 'circle';

export default function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>('pen');
  const [lineWidth, setLineWidth] = useState(3);
  const [color, setColor] = useState('#FFFFFF');
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const colors = ['#FFFFFF', '#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#A855F7'];

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
    contextRef.current = context;
    redrawCanvas();
  }, []);

  const redrawCanvas = () => {
    const context = contextRef.current;
    if (!context || !canvasRef.current) return;
    if (historyIndex >= 0 && history[historyIndex]) {
      context.putImageData(history[historyIndex], 0, 0);
    } else {
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    }
  }

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [resizeCanvas]);

  const saveHistory = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(context.getImageData(0, 0, canvas.width, canvas.height));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      redrawCanvas();
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      redrawCanvas();
    }
  }
  
  const getCoordinates = (event: MouseEvent | Touch) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'clientX' in event ? event.clientX : event.touches[0].clientX;
    const clientY = 'clientY' in event ? event.clientY : event.touches[0].clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    const context = contextRef.current;
    if (!context) return;
    const { x, y } = getCoordinates('nativeEvent' in event ? event.nativeEvent : event);
    
    context.beginPath();
    context.moveTo(x, y);
    context.strokeStyle = tool === 'eraser' ? 'hsl(var(--background))' : color;
    context.lineWidth = lineWidth;
    context.lineCap = 'round';
    context.lineJoin = 'round';

    setIsDrawing(true);
  };

  const finishDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    if(!isDrawing) return;
    contextRef.current?.closePath();
    setIsDrawing(false);
    saveHistory();
  };

  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    if (!isDrawing) return;
    const context = contextRef.current;
    if (!context) return;
    const { x, y } = getCoordinates('nativeEvent' in event ? event.nativeEvent : event);
    
    context.lineTo(x, y);
    context.stroke();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      setHistory([]);
      setHistoryIndex(-1);
    }
  };

  const handleToolChange = (newTool: Tool) => {
    setTool(newTool);
  }

  return (
    <div className="w-full h-full bg-card relative overflow-hidden flex flex-col">
       <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-secondary shadow-md rounded-lg p-1 flex items-center gap-1">
        <Button variant={tool === 'pen' ? 'default' : 'ghost'} size="icon" onClick={() => handleToolChange('pen')}><Pen/></Button>
        <Button variant={tool === 'eraser' ? 'default' : 'ghost'} size="icon" onClick={() => handleToolChange('eraser')}><Eraser/></Button>
        <div className="w-px h-8 bg-border mx-1" />
        <Button variant="ghost" size="icon" onClick={undo} disabled={historyIndex <= 0}><Undo/></Button>
        <Button variant="ghost" size="icon" onClick={redo} disabled={historyIndex >= history.length - 1}><Redo/></Button>
        <div className="w-px h-8 bg-border mx-1" />

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon">
              <div className="w-5 h-5 rounded-full border-2 border-primary-foreground" style={{ backgroundColor: color }} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="flex gap-1">
              {colors.map(c => (
                <Button key={c} size="icon" variant="ghost" className="w-8 h-8 rounded-full" onClick={() => setColor(c)}>
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: c }} />
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon"><Palette/></Button>
          </PopoverTrigger>
          <PopoverContent className="w-40 p-2">
            <Slider defaultValue={[lineWidth]} max={50} step={1} onValueChange={(value) => setLineWidth(value[0])} />
          </PopoverContent>
        </Popover>

        <div className="w-px h-8 bg-border mx-1" />
        <Button variant="ghost" size="icon" onClick={clearCanvas}><Trash2/></Button>
      </div>

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
        className="flex-1 w-full h-full cursor-crosshair"
      />
    </div>
  );
}