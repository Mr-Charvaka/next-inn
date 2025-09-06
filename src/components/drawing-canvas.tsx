"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Eraser, Pen, Square, Circle as CircleIcon, Trash2, Redo, Undo, Hand } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';

type Tool = 'pen' | 'eraser' | 'rect' | 'circle' | 'hand';
type Point = { x: number; y: number };
type DrawingAction = {
  id: number;
  tool: Exclude<Tool, 'hand'>;
  color: string;
  lineWidth: number;
  points: Point[];
};

export default function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [tool, setTool] = useState<Tool>('pen');
  const [lineWidth, setLineWidth] = useState(3);
  const [color, setColor] = useState('#FFFFFF');
  
  const [history, setHistory] = useState<DrawingAction[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);

  const [viewOffset, setViewOffset] = useState<Point>({ x: 0, y: 0 });
  const panStartRef = useRef<Point | null>(null);

  const colors = ['#FFFFFF', '#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#A855F7'];

  const getCanvasContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d');
  }, []);

  const getCoordinates = (event: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in event && (event as React.TouchEvent).touches.length > 0) {
        clientX = (event as React.TouchEvent).touches[0].clientX;
        clientY = (event as React.TouchEvent).touches[0].clientY;
    } else if ('changedTouches' in event && (event as React.TouchEvent).changedTouches.length > 0){
        clientX = (event as React.TouchEvent).changedTouches[0].clientX;
        clientY = (event as React.TouchEvent).changedTouches[0].clientY;
    } else {
      clientX = (event as React.MouseEvent).clientX;
      clientY = (event as React.MouseEvent).clientY;
    }
    
    const dpr = window.devicePixelRatio || 1;
    return { x: (clientX - rect.left) * dpr, y: (clientY - rect.top) * dpr };
  }

  const getCanvasCoordinates = (event: React.MouseEvent | React.TouchEvent): Point => {
    const coords = getCoordinates(event);
    return { x: coords.x - viewOffset.x, y: coords.y - viewOffset.y };
  }

  const redrawCanvas = useCallback(() => {
    const context = getCanvasContext();
    const canvas = canvasRef.current;
    if (!context || !canvas) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#000000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.save();
    context.translate(viewOffset.x, viewOffset.y);

    const activeHistory = history.slice(0, historyIndex + 1);

    activeHistory.forEach(action => {
      context.beginPath();
      context.strokeStyle = action.tool === 'eraser' ? '#000000' : action.color;
      context.lineWidth = action.lineWidth;
      context.lineCap = 'round';
      context.lineJoin = 'round';

      if (action.tool === 'pen' || action.tool === 'eraser') {
        if(action.points.length > 0) {
            context.moveTo(action.points[0].x, action.points[0].y);
            action.points.forEach(point => context.lineTo(point.x, point.y));
            context.stroke();
        }
      } else if (action.points.length === 2) {
        const [start, end] = action.points;
        if (action.tool === 'rect') {
          context.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
        } else if (action.tool === 'circle') {
          const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
          context.beginPath();
          context.arc(start.x, start.y, radius, 0, 2 * Math.PI);
          context.stroke();
        }
      }
    });

    context.restore();

  }, [getCanvasContext, history, historyIndex, viewOffset]);

  useEffect(() => {
    redrawCanvas();
  }, [history, historyIndex, viewOffset, redrawCanvas]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const context = getCanvasContext();
    if (!canvas || !canvas.parentElement || !context) return;
    
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    redrawCanvas();
  }, [getCanvasContext, redrawCanvas]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [resizeCanvas]);

  const startAction = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    if (tool === 'hand') {
      setIsPanning(true);
      panStartRef.current = getCoordinates(event);
    } else {
      setIsDrawing(true);
      const startPoint = getCanvasCoordinates(event);
      setCurrentPath([startPoint]);
    }
  };

  const moveAction = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    if (isPanning && panStartRef.current) {
      const currentPanPoint = getCoordinates(event);
      setViewOffset(prevOffset => ({
        x: prevOffset.x + (currentPanPoint.x - panStartRef.current!.x),
        y: prevOffset.y + (currentPanPoint.y - panStartRef.current!.y),
      }));
      panStartRef.current = currentPanPoint;
    }

    if (!isDrawing) return;
    const point = getCanvasCoordinates(event);

    if (tool === 'pen' || tool === 'eraser') {
      setCurrentPath(prev => [...prev, point]);
    } else {
      setCurrentPath(prev => [prev[0], point]);
    }
  };

  const finishAction = () => {
    if (isPanning) {
      setIsPanning(false);
      panStartRef.current = null;
    }

    if (isDrawing) {
      setIsDrawing(false);
      if (currentPath.length > 0 && tool !== 'hand') {
        const newAction: DrawingAction = {
          id: Date.now(),
          tool,
          color,
          lineWidth,
          points: currentPath,
        };
        const newHistory = history.slice(0, historyIndex + 1);
        setHistory([...newHistory, newAction]);
        setHistoryIndex(newHistory.length);
      }
      setCurrentPath([]);
    }
  };
  
  const undo = () => {
    if (historyIndex >= 0) {
      setHistoryIndex(prev => prev - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
    }
  };

  const clearCanvas = () => {
    setHistory([]);
    setHistoryIndex(-1);
    setViewOffset({ x: 0, y: 0 });
  };
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = getCanvasContext();
    if (!context) return;
    
    redrawCanvas();
    
    if (isDrawing && currentPath.length > 1) {
      context.save();
      context.translate(viewOffset.x, viewOffset.y);
      
      context.beginPath();
      context.strokeStyle = tool === 'eraser' ? '#000000' : color;
      context.lineWidth = lineWidth;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      
      const [start, end] = [currentPath[0], currentPath[currentPath.length - 1]];
      
      if (tool === 'pen' || tool === 'eraser') {
        context.moveTo(currentPath[0].x, currentPath[0].y);
        currentPath.forEach(p => context.lineTo(p.x, p.y));
        context.stroke();
      } else if (tool === 'rect') {
        context.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
      } else if (tool === 'circle') {
        const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
        context.beginPath();
        context.arc(start.x, start.y, radius, 0, 2 * Math.PI);
        context.stroke();
      }
      
      context.restore();
    }
  }, [isDrawing, currentPath, color, lineWidth, tool, viewOffset, getCanvasContext, redrawCanvas]);

  const getCursor = () => {
    if (tool === 'hand') {
      return isPanning ? 'grabbing' : 'grab';
    }
    return 'crosshair';
  };

  return (
    <div className="w-full h-full bg-card relative overflow-hidden flex flex-col">
       <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-secondary shadow-md rounded-lg p-1 flex items-center gap-1">
        <Button variant={tool === 'hand' ? 'default' : 'ghost'} size="icon" onClick={() => setTool('hand')}><Hand/></Button>
        <Button variant={tool === 'pen' ? 'default' : 'ghost'} size="icon" onClick={() => setTool('pen')}><Pen/></Button>
        <Button variant={tool === 'rect' ? 'default' : 'ghost'} size="icon" onClick={() => setTool('rect')}><Square/></Button>
        <Button variant={tool === 'circle' ? 'default' : 'ghost'} size="icon" onClick={() => setTool('circle')}><CircleIcon/></Button>
        <Button variant={tool === 'eraser' ? 'default' : 'ghost'} size="icon" onClick={() => setTool('eraser')}><Eraser/></Button>
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
        onMouseDown={startAction}
        onMouseMove={moveAction}
        onMouseUp={finishAction}
        onMouseLeave={finishAction}
        onTouchStart={startAction}
        onTouchMove={moveAction}
        onTouchEnd={finishAction}
        style={{ touchAction: 'none', cursor: getCursor() }}
        className="flex-1 w-full h-full"
      />
    </div>
  );
}
