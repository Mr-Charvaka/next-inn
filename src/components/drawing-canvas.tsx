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

type InteractionMode = 'none' | 'drawing' | 'panning' | 'selecting' | 'moving' | 'resizing';
type ResizeHandle = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';


const getBoundingBox = (points: Point[]): [Point, Point] => {
  if (points.length === 0) return [{x:0, y:0}, {x:0, y:0}];
  
  const xCoords = points.map(p => p.x);
  const yCoords = points.map(p => p.y);
  
  const minX = Math.min(...xCoords);
  const minY = Math.min(...yCoords);
  const maxX = Math.max(...xCoords);
  const maxY = Math.max(...yCoords);

  return [{ x: minX, y: minY }, { x: maxX, y: maxY }];
};


export default function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('none');
  const [tool, setTool] = useState<Tool>('pen');
  const [lineWidth, setLineWidth] = useState(3);
  const [color, setColor] = useState('#FFFFFF');
  
  const [history, setHistory] = useState<DrawingAction[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);

  const [viewOffset, setViewOffset] = useState<Point>({ x: 0, y: 0 });
  const panStartRef = useRef<Point | null>(null);

  const [selectedActionId, setSelectedActionId] = useState<number | null>(null);
  const actionStartRef = useRef<Point | null>(null);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle | null>(null);

  const colors = ['#FFFFFF', '#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#A855F7'];

  const getCanvasContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d');
  }, []);

  const getCoordinates = (event: React.PointerEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    const dpr = window.devicePixelRatio || 1;
    return { x: (event.clientX - rect.left) * dpr, y: (event.clientY - rect.top) * dpr };
  }

  const getCanvasCoordinates = (event: React.PointerEvent): Point => {
    const coords = getCoordinates(event);
    return { x: coords.x - viewOffset.x, y: coords.y - viewOffset.y };
  }

  const drawAction = (context: CanvasRenderingContext2D, action: DrawingAction) => {
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
        const a = end.x - start.x;
        const b = end.y - start.y;
        const radiusX = Math.abs(a / 2);
        const radiusY = Math.abs(b / 2);
        const centerX = start.x + a / 2;
        const centerY = start.y + b / 2;
        context.beginPath();
        context.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
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
    
    // Draw selection box
    if (selectedActionId) {
      const selectedAction = history.find(a => a.id === selectedActionId);
      if (selectedAction) {
        const [start, end] = getBoundingBox(selectedAction.points);
        context.strokeStyle = '#3B82F6';
        context.lineWidth = 2;
        context.setLineDash([6, 3]);
        context.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
        context.setLineDash([]);
        
        // Draw resize handles
        const handleSize = 8;
        context.fillStyle = '#3B82F6';
        context.fillRect(start.x - handleSize/2, start.y - handleSize/2, handleSize, handleSize);
        context.fillRect(end.x - handleSize/2, start.y - handleSize/2, handleSize, handleSize);
        context.fillRect(start.x - handleSize/2, end.y - handleSize/2, handleSize, handleSize);
        context.fillRect(end.x - handleSize/2, end.y - handleSize/2, handleSize, handleSize);
      }
    }

    context.restore();

  }, [getCanvasContext, history, historyIndex, viewOffset, selectedActionId]);

  useEffect(() => {
    redrawCanvas();
  }, [history, historyIndex, viewOffset, redrawCanvas, selectedActionId]);

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

  const pointInRect = (point: Point, rect: [Point, Point]) => {
    const [start, end] = rect;
    return point.x >= start.x && point.x <= end.x && point.y >= start.y && point.y <= end.y;
  }
  
  const getActionAtPoint = (point: Point) => {
    // Iterate backwards to select the top-most element
    for (let i = historyIndex; i >= 0; i--) {
        const action = history[i];
        if (pointInRect(point, getBoundingBox(action.points))) {
            return action;
        }
    }
    return null;
  }

  const getResizeHandleAtPoint = (point: Point, action: DrawingAction): ResizeHandle | null => {
    const [start, end] = getBoundingBox(action.points);
    const handleSize = 12;
    if (pointInRect(point, [{x: start.x - handleSize/2, y: start.y - handleSize/2}, {x: start.x + handleSize/2, y: start.y + handleSize/2}])) return 'topLeft';
    if (pointInRect(point, [{x: end.x - handleSize/2, y: start.y - handleSize/2}, {x: end.x + handleSize/2, y: start.y + handleSize/2}])) return 'topRight';
    if (pointInRect(point, [{x: start.x - handleSize/2, y: end.y - handleSize/2}, {x: start.x + handleSize/2, y: end.y + handleSize/2}])) return 'bottomLeft';
    if (pointInRect(point, [{x: end.x - handleSize/2, y: end.y - handleSize/2}, {x: end.x + handleSize/2, y: end.y + handleSize/2}])) return 'bottomRight';
    return null;
  }

  const startAction = (event: React.PointerEvent) => {
    event.preventDefault();
    if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    const startPoint = getCanvasCoordinates(event);
    actionStartRef.current = startPoint;
    
    if (tool === 'hand') {
      setInteractionMode('panning');
      panStartRef.current = getCoordinates(event);
    } else if (tool === 'select') {
      const selectedAction = selectedActionId ? history.find(a => a.id === selectedActionId) : null;
      if (selectedAction) {
        const handle = getResizeHandleAtPoint(startPoint, selectedAction);
        if (handle) {
          setInteractionMode('resizing');
          setResizeHandle(handle);
          return;
        }
      }

      const actionAtPoint = getActionAtPoint(startPoint);
      if (actionAtPoint) {
        setSelectedActionId(actionAtPoint.id);
        setInteractionMode('moving');
      } else {
        setSelectedActionId(null);
        setInteractionMode('selecting');
      }
    }
    else {
      setInteractionMode('drawing');
      setCurrentPath([startPoint]);
      setSelectedActionId(null);
    }
  };

  const moveAction = (event: React.PointerEvent) => {
    event.preventDefault();
    if (interactionMode === 'none') return;

    const currentPoint = getCanvasCoordinates(event);

    if (interactionMode === 'panning' && panStartRef.current) {
        const currentPanPoint = getCoordinates(event);
        setViewOffset(prevOffset => {
            if (!panStartRef.current) return prevOffset;
            return {
                x: prevOffset.x + (currentPanPoint.x - panStartRef.current!.x),
                y: prevOffset.y + (currentPanPoint.y - panStartRef.current!.y),
            }
        });
        panStartRef.current = currentPanPoint;
    } else if (interactionMode === 'drawing') {
      if (tool === 'pen' || tool === 'eraser') {
        setCurrentPath(prev => [...prev, currentPoint]);
      } else {
        setCurrentPath(prev => [prev[0], currentPoint]);
      }
    } else if (interactionMode === 'moving' && selectedActionId && actionStartRef.current) {
        const dx = currentPoint.x - actionStartRef.current.x;
        const dy = currentPoint.y - actionStartRef.current.y;
        
        setHistory(prevHistory => prevHistory.map(action => {
            if (action.id === selectedActionId) {
                return {
                    ...action,
                    points: action.points.map(p => ({ x: p.x + dx, y: p.y + dy }))
                };
            }
            return action;
        }));
        actionStartRef.current = currentPoint;
    } else if (interactionMode === 'resizing' && selectedActionId && actionStartRef.current && resizeHandle) {
        const selectedAction = history.find(a => a.id === selectedActionId);
        if (!selectedAction) return;

        let [min, max] = getBoundingBox(selectedAction.points);

        switch (resizeHandle) {
            case 'topLeft': min = currentPoint; break;
            case 'topRight': min = {x: min.x, y: currentPoint.y}; max = {x: currentPoint.x, y: max.y}; break;
            case 'bottomLeft': min = {x: currentPoint.x, y: min.y}; max = {x: max.x, y: currentPoint.y}; break;
            case 'bottomRight': max = currentPoint; break;
        }

        // To allow flipping
        const newMin = {x: Math.min(min.x, max.x), y: Math.min(min.y, max.y)};
        const newMax = {x: Math.max(min.x, max.x), y: Math.max(min.y, max.y)};
        
        setHistory(prevHistory => prevHistory.map(action => {
            if (action.id === selectedActionId) {
              if (action.tool === 'pen' || action.tool === 'eraser') {
                  const [originalMin, originalMax] = getBoundingBox(action.points);
                  const scaleX = (newMax.x - newMin.x) / (originalMax.x - originalMin.x);
                  const scaleY = (newMax.y - newMin.y) / (originalMax.y - originalMin.y);

                  return { ...action, points: action.points.map(p => ({
                    x: newMin.x + (p.x - originalMin.x) * (isNaN(scaleX) ? 1 : scaleX),
                    y: newMin.y + (p.y - originalMin.y) * (isNaN(scaleY) ? 1 : scaleY)
                  })) };
              }
              return { ...action, points: [newMin, newMax] };
            }
            return action;
        }));
    }
  };

  const finishAction = () => {
    if (interactionMode === 'drawing') {
      if (currentPath.length > 0 && tool !== 'hand' && tool !== 'select') {
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
    } else if (interactionMode === 'moving' || interactionMode === 'resizing') {
      // Potentially save history state here if move/resize should be undoable
    }

    setInteractionMode('none');
    panStartRef.current = null;
    actionStartRef.current = null;
    setResizeHandle(null);
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
    setSelectedActionId(null);
  };
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = getCanvasContext();
    if (!context) return;
    
    redrawCanvas();
    
    if (interactionMode === 'drawing' && currentPath.length > 1) {
      context.save();
      context.translate(viewOffset.x, viewOffset.y);
      
      const tempAction : DrawingAction = { 
          id: 0, 
          tool: tool as Exclude<Tool, 'hand' | 'select'>, 
          color, 
          lineWidth, 
          points: currentPath 
      };
      drawAction(context, tempAction);
      
      context.restore();
    }
  }, [interactionMode, currentPath, color, lineWidth, tool, viewOffset, getCanvasContext, redrawCanvas]);

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
        onPointerDown={startAction}
        onPointerMove={moveAction}
        onPointerUp={finishAction}
        onPointerLeave={finishAction}
        style={{ touchAction: 'none', cursor: getCursor() }}
        className="flex-1 w-full h-full"
      />
    </div>
  );
}
