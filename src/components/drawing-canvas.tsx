"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Eraser, Pen, Square, Circle as CircleIcon, Trash2, Redo, Undo, Hand, MousePointer2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';

type Tool = 'pen' | 'eraser' | 'rect' | 'circle' | 'hand' | 'select';
type Point = { x: number; y: number };
type DrawingAction = {
  id: number;
  tool: Exclude<Tool, 'hand' | 'select'>;
  color: string;
  lineWidth: number;
  points: Point[];
};

type InteractionMode = 'none' | 'drawing' | 'panning' | 'selecting' | 'moving';
type BoundingBox = { minX: number; minY: number; maxX: number; maxY: number };

const getActionBoundingBox = (action: DrawingAction): BoundingBox => {
  const { points } = action;
  if (points.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

  const xCoords = points.map(p => p.x);
  const yCoords = points.map(p => p.y);

  return {
    minX: Math.min(...xCoords),
    minY: Math.min(...yCoords),
    maxX: Math.max(...xCoords),
    maxY: Math.max(...yCoords),
  };
};

export default function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('none');
  const [tool, setTool] = useState<Tool>('pen');
  const [lineWidth, setLineWidth] = useState(3);
  const [color, setColor] = useState('#FFFFFF');
  
  const [history, setHistory] = useState<DrawingAction[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const [viewOffset, setViewOffset] = useState<Point>({ x: 0, y: 0 });
  const [startPoint, setStartPoint] = useState<Point | null>(null);

  const [selectedActionIds, setSelectedActionIds] = useState<Set<number>>(new Set());
  const [selectionBox, setSelectionBox] = useState<{start: Point, end: Point} | null>(null);

  const colors = ['#FFFFFF', '#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#A855F7'];

  const getCanvasContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d');
  }, []);

  const getCanvasCoordinates = (event: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const canvasX = (event.clientX - rect.left) * dpr;
    const canvasY = (event.clientY - rect.top) * dpr;
    return { x: canvasX - viewOffset.x, y: canvasY - viewOffset.y };
  }

  const drawAction = (context: CanvasRenderingContext2D, action: DrawingAction) => {
    context.beginPath();
    context.strokeStyle = action.color;
    if (action.tool === 'eraser') {
       context.strokeStyle = '#000000';
    }
    context.lineWidth = action.lineWidth;
    context.lineCap = 'round';
    context.lineJoin = 'round';

    if (action.tool === 'pen' || action.tool === 'eraser') {
      if(action.points.length > 1) {
          context.moveTo(action.points[0].x, action.points[0].y);
          for (let i = 1; i < action.points.length; i++) {
            context.lineTo(action.points[i].x, action.points[i].y);
          }
          context.stroke();
      } else if (action.points.length === 1) {
          context.fillStyle = context.strokeStyle;
          context.beginPath();
          context.arc(action.points[0].x, action.points[0].y, action.lineWidth / 2, 0, Math.PI * 2);
          context.fill();
      }
    } else if (action.points.length === 2) {
      const [start, end] = action.points;
      const minX = Math.min(start.x, end.x);
      const minY = Math.min(start.y, end.y);
      const width = Math.abs(start.x - end.x);
      const height = Math.abs(start.y - end.y);

      if (action.tool === 'rect') {
        context.strokeRect(minX, minY, width, height);
      } else if (action.tool === 'circle') {
        context.beginPath();
        context.ellipse(minX + width / 2, minY + height / 2, width / 2, height / 2, 0, 0, 2 * Math.PI);
        context.stroke();
      }
    }
  };

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
    activeHistory.forEach(action => drawAction(context, action));
    
    // Draw selection highlights
    context.strokeStyle = '#3B82F6';
    context.setLineDash([6, 3]);
    context.lineWidth = 1;
    activeHistory.forEach(action => {
      if (selectedActionIds.has(action.id)) {
        const { minX, minY, maxX, maxY } = getActionBoundingBox(action);
        context.strokeRect(minX - 2, minY - 2, maxX - minX + 4, maxY - minY + 4);
      }
    });
    context.setLineDash([]);
    
    // Draw selection box (marquee)
    if (selectionBox) {
        context.strokeStyle = 'rgba(59, 130, 246, 0.8)';
        context.fillStyle = 'rgba(59, 130, 246, 0.2)';
        context.lineWidth = 1;
        const width = selectionBox.end.x - selectionBox.start.x;
        const height = selectionBox.end.y - selectionBox.start.y;
        context.fillRect(selectionBox.start.x, selectionBox.start.y, width, height);
        context.strokeRect(selectionBox.start.x, selectionBox.start.y, width, height);
    }

    context.restore();

  }, [getCanvasContext, history, historyIndex, viewOffset, selectedActionIds, selectionBox]);

  useEffect(() => {
    redrawCanvas();
  }, [history, historyIndex, viewOffset, redrawCanvas, selectedActionIds, selectionBox]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;
    
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    redrawCanvas();
  }, [redrawCanvas]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [resizeCanvas]);

  const isPointInsideBox = (point: Point, box: BoundingBox) => {
    return point.x >= box.minX && point.x <= box.maxX && point.y >= box.minY && point.y <= box.maxY;
  };
  
  const getActionAtPoint = (point: Point) => {
    for (let i = historyIndex; i >= 0; i--) {
        const action = history[i];
        const box = getActionBoundingBox(action);
        if (isPointInsideBox(point, box)) {
            return action;
        }
    }
    return null;
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (event.pointerType === 'touch' && tool !== 'hand') return;
    if (event.button !== 0) return; // Only main click
    const currentPoint = getCanvasCoordinates(event);
    setStartPoint(currentPoint);

    if (tool === 'hand') {
        setInteractionMode('panning');
        return;
    }

    if (tool === 'select') {
        const actionAtPoint = getActionAtPoint(currentPoint);
        if (actionAtPoint) {
            setInteractionMode('moving');
            if (!selectedActionIds.has(actionAtPoint.id)) {
                const newSelection = new Set([actionAtPoint.id]);
                setSelectedActionIds(newSelection);
            }
        } else {
            setInteractionMode('selecting');
            setSelectedActionIds(new Set());
            setSelectionBox({ start: currentPoint, end: currentPoint });
        }
        return;
    }
    
    setInteractionMode('drawing');
    setSelectedActionIds(new Set());

    const newAction: DrawingAction = {
      id: Date.now(),
      tool: tool as Exclude<Tool, 'hand'|'select'>,
      color,
      lineWidth,
      points: [currentPoint]
    };
    
    const newHistory = history.slice(0, historyIndex + 1);
    setHistory([...newHistory, newAction]);
    setHistoryIndex(newHistory.length);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!startPoint) return;
    const currentPoint = getCanvasCoordinates(event);

    if (interactionMode === 'panning') {
        const dx = (event.clientX * (window.devicePixelRatio || 1)) - (startPoint.x + viewOffset.x);
        const dy = (event.clientY * (window.devicePixelRatio || 1)) - (startPoint.y + viewOffset.y);
        const panDx = currentPoint.x - startPoint.x;
        const panDy = currentPoint.y - startPoint.y;

        setViewOffset(prev => ({x: prev.x + panDx, y: prev.y + panDy}));
        return;
    }

    if (interactionMode === 'moving') {
        const dx = currentPoint.x - startPoint.x;
        const dy = currentPoint.y - startPoint.y;

        setHistory(prev => prev.map(action => {
            if (selectedActionIds.has(action.id)) {
                return { ...action, points: action.points.map(p => ({ x: p.x + dx, y: p.y + dy })) };
            }
            return action;
        }));
        setStartPoint(currentPoint);
        return;
    }

    if (interactionMode === 'selecting') {
        setSelectionBox({ start: startPoint, end: currentPoint });
        return;
    }
    
    if (interactionMode === 'drawing') {
      const currentHistory = history.slice(0, historyIndex + 1);
      const lastAction = currentHistory[currentHistory.length - 1];
      if (!lastAction) return;

      if (tool === 'pen' || tool === 'eraser') {
        const updatedPoints = [...lastAction.points, currentPoint];
        const updatedAction = { ...lastAction, points: updatedPoints };
        const newHistory = [...currentHistory.slice(0, -1), updatedAction];
        setHistory(newHistory);
      } else {
        const updatedPoints = [startPoint, currentPoint];
        const updatedAction = { ...lastAction, points: updatedPoints };
        const newHistory = [...currentHistory.slice(0, -1), updatedAction];
        setHistory(newHistory);
        redrawCanvas();
      }
    }
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (interactionMode === 'selecting' && selectionBox) {
        const selectionRect = {
            minX: Math.min(selectionBox.start.x, selectionBox.end.x),
            minY: Math.min(selectionBox.start.y, selectionBox.end.y),
            maxX: Math.max(selectionBox.start.x, selectionBox.end.x),
            maxY: Math.max(selectionBox.start.y, selectionBox.end.y),
        };
        
        const idsToSelect = new Set<number>();
        history.slice(0, historyIndex + 1).forEach(action => {
            const actionBox = getActionBoundingBox(action);
            // Check for intersection
            if (actionBox.minX < selectionRect.maxX && actionBox.maxX > selectionRect.minX &&
                actionBox.minY < selectionRect.maxY && actionBox.maxY > selectionRect.minY) {
                idsToSelect.add(action.id);
            }
        });
        setSelectedActionIds(idsToSelect);
    }
    
    if (interactionMode === 'drawing') {
      // The history has already been updated in pointer move
    }

    setInteractionMode('none');
    setStartPoint(null);
    setSelectionBox(null);
  };
  
  const undo = () => {
    if (historyIndex >= 0) {
      setHistoryIndex(prev => prev - 1);
      setSelectedActionIds(new Set());
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setSelectedActionIds(new Set());
    }
  };

  const clearCanvas = () => {
    setHistory([]);
    setHistoryIndex(-1);
    setViewOffset({ x: 0, y: 0 });
    setSelectedActionIds(new Set());
  };
  
  const getCursor = () => {
    if (tool === 'hand') {
      return interactionMode === 'panning' ? 'grabbing' : 'grab';
    }
    if (tool === 'select') {
      return 'default';
    }
    return 'crosshair';
  };

  return (
    <div className="w-full h-full bg-card relative overflow-hidden flex flex-col">
       <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-secondary shadow-md rounded-lg p-1 flex items-center gap-1">
        <Button variant={tool === 'select' ? 'default' : 'ghost'} size="icon" onClick={() => setTool('select')}><MousePointer2/></Button>
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
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp} // End action if pointer leaves canvas
        style={{ touchAction: 'none', cursor: getCursor() }}
        className="flex-1 w-full h-full"
      />
    </div>
  );
}
