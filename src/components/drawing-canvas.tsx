"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Eraser, Pen, Square, Circle as CircleIcon, Trash2, Redo, Undo } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';

type Tool = 'pen' | 'eraser' | 'rect' | 'circle';

export default function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>('pen');
  const [lineWidth, setLineWidth] = useState(3);
  const [color, setColor] = useState('#FFFFFF');
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [startPos, setStartPos] = useState<{ x: number, y: number } | null>(null);

  const colors = ['#FFFFFF', '#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#A855F7'];

  const getCanvasContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d');
  }, []);

  const redrawCanvas = useCallback(() => {
    const context = getCanvasContext();
    if (!context || !canvasRef.current) return;

    if (historyIndex >= 0 && history[historyIndex]) {
      context.putImageData(history[historyIndex], 0, 0);
    } else {
      const dpr = window.devicePixelRatio || 1;
      context.clearRect(0, 0, context.canvas.width / dpr, context.canvas.height / dpr);
    }
  }, [history, historyIndex, getCanvasContext]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const context = getCanvasContext();
    if (!canvas || !canvas.parentElement || !context) return;
    
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();

    // Save history before resizing
    if (history.length > 0 && historyIndex >= 0) {
      saveHistory();
    }
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    context.scale(dpr, dpr);
    
    // After resizing, the context is reset, so we need to set our styles again
    contextRef.current = context;
    redrawCanvas();

  }, [getCanvasContext, redrawCanvas, history.length, historyIndex]);


  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [resizeCanvas]);

  const saveHistory = useCallback(() => {
    const canvas = canvasRef.current;
    const context = getCanvasContext();
    if (!canvas || !context) return;
    
    const dpr = window.devicePixelRatio || 1;
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    const newHistory = history.slice(0, historyIndex + 1);
    if (newHistory.length >= 100) {
      newHistory.shift(); 
    }
    newHistory.push(imageData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex, getCanvasContext]);


  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
    } else if (historyIndex === 0) {
      setHistoryIndex(-1);
      const context = getCanvasContext();
      if(context && canvasRef.current) {
         const dpr = window.devicePixelRatio || 1;
         context.clearRect(0, 0, canvasRef.current.width/dpr, canvasRef.current.height/dpr);
      }
    }
  }, [historyIndex, getCanvasContext]);

  useEffect(() => {
    redrawCanvas();
  }, [historyIndex, redrawCanvas]);

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
    }
  }
  
  const getCoordinates = (event: MouseEvent | Touch | React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    let clientX, clientY;
    if ('touches' in event && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else if ('changedTouches' in event && event.changedTouches.length > 0) {
      clientX = event.changedTouches[0].clientX;
      clientY = event.changedTouches[0].clientY;
    }
    else {
      clientX = (event as React.MouseEvent).clientX;
      clientY = (event as React.MouseEvent).clientY;
    }
    
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    const context = getCanvasContext();
    if (!context) return;
    const { x, y } = getCoordinates(event);
    
    setStartPos({x, y});
    setIsDrawing(true);
    
    if (tool === 'pen' || tool === 'eraser') {
      context.beginPath();
      context.moveTo(x, y);
      context.strokeStyle = tool === 'eraser' ? 'hsl(var(--card))' : color;
      context.lineWidth = lineWidth;
      context.lineCap = 'round';
      context.lineJoin = 'round';
    } else {
        if(historyIndex >= 0) {
             context.putImageData(history[historyIndex], 0, 0);
        } else {
             const dpr = window.devicePixelRatio || 1;
             context.clearRect(0, 0, context.canvas.width/dpr, context.canvas.height/dpr);
        }
    }
  };

  const finishDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    if(!isDrawing) return;
    setIsDrawing(false);
    const context = getCanvasContext();
    if(!context) return;

    if (tool === 'pen' || tool === 'eraser') {
        context.closePath();
    }
    
    const { x, y } = getCoordinates(event);
    drawShape(context, x, y);
    
    saveHistory();
    setStartPos(null);
  };
  
  const drawShape = (context: CanvasRenderingContext2D, x: number, y: number) => {
      if(!startPos) return;

      context.fillStyle = color;
      context.strokeStyle = color;
      context.lineWidth = lineWidth;

      switch(tool) {
          case 'rect':
              context.strokeRect(startPos.x, startPos.y, x - startPos.x, y - startPos.y);
              break;
          case 'circle':
              const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2));
              context.beginPath();
              context.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
              context.stroke();
              break;
          default:
            return;
      }
  }


  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const context = getCanvasContext();
    if (!context || !startPos) return;
    const { x, y } = getCoordinates(event);
    
    if (tool === 'pen' || tool === 'eraser') {
        context.lineTo(x, y);
        context.stroke();
    } else {
        redrawCanvas();
        drawShape(context, x, y);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = getCanvasContext();
    if (canvas && context) {
      const dpr = window.devicePixelRatio || 1;
      context.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
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
        <Button variant={tool === 'rect' ? 'default' : 'ghost'} size="icon" onClick={() => handleToolChange('rect')}><Square/></Button>
        <Button variant={tool === 'circle' ? 'default' : 'ghost'} size="icon" onClick={() => handleToolChange('circle')}><CircleIcon/></Button>
        <Button variant={tool === 'eraser' ? 'default' : 'ghost'} size="icon" onClick={() => handleToolChange('eraser')}><Eraser/></Button>
        <div className="w-px h-8 bg-border mx-1" />
        <Button variant="ghost" size="icon" onClick={undo} disabled={historyIndex < 0}><Undo/></Button>
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
             <Button variant="ghost" size="icon" className="w-20">{lineWidth}px</Button>
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
