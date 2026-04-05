import React, { useState, useEffect, useRef } from 'react';
import { GraphType, Params, SavedGraph } from '../types';
import { X, ZoomIn, ZoomOut, RefreshCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface Props {
  type: GraphType;
  params: Params;
  savedGraphs?: SavedGraph[];
  onRemoveSavedGraph?: (id: string) => void;
}

export default function Graph({ type, params, savedGraphs = [], onRemoveSavedGraph }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 600 });
  const [bounds, setBounds] = useState({ xMin: -20, xMax: 20, yMin: -20, yMax: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPt, setLastPt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
          // Adjust bounds to maintain aspect ratio based on width
          setBounds(b => {
            const currentW = b.xMax - b.xMin;
            const currentH = b.yMax - b.yMin;
            const targetH = currentW * (height / width);
            const cy = (b.yMin + b.yMax) / 2;
            return { ...b, yMin: cy - targetH / 2, yMax: cy + targetH / 2 };
          });
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const { width: SVG_W, height: SVG_H } = dimensions;

  const mapX = (x: number) => ((x - bounds.xMin) / (bounds.xMax - bounds.xMin)) * SVG_W;
  const mapY = (y: number) => ((bounds.yMax - y) / (bounds.yMax - bounds.yMin)) * SVG_H;

  // Generate grid lines
  const gridLines = [];
  const xStart = Math.floor(bounds.xMin);
  const xEnd = Math.ceil(bounds.xMax);
  for (let i = xStart; i <= xEnd; i++) {
    gridLines.push(<line key={`v${i}`} x1={mapX(i)} x2={mapX(i)} y1={0} y2={SVG_H} stroke="#f1f5f9" strokeWidth={i === 0 ? 2 : 1} strokeDasharray={i !== 0 && i % 5 === 0 ? "4 4" : "none"} />);
  }
  const yStart = Math.floor(bounds.yMin);
  const yEnd = Math.ceil(bounds.yMax);
  for (let i = yStart; i <= yEnd; i++) {
    gridLines.push(<line key={`h${i}`} x1={0} x2={SVG_W} y1={mapY(i)} y2={mapY(i)} stroke="#f1f5f9" strokeWidth={i === 0 ? 2 : 1} strokeDasharray={i !== 0 && i % 5 === 0 ? "4 4" : "none"} />);
  }

  // Axes
  const axes = (
    <>
      <line x1={0} x2={SVG_W} y1={mapY(0)} y2={mapY(0)} stroke="#94a3b8" strokeWidth={2} />
      <line x1={mapX(0)} x2={mapX(0)} y1={0} y2={SVG_H} stroke="#94a3b8" strokeWidth={2} />
      {/* Labels */}
      <text x={SVG_W - 15} y={mapY(0) - 10} className="text-sm fill-gray-500 font-mono">x</text>
      <text x={mapX(0) + 10} y={15} className="text-sm fill-gray-500 font-mono">y</text>
      <text x={mapX(1)} y={mapY(0) + 15} className="text-xs fill-gray-400 text-center" textAnchor="middle">1</text>
      <text x={mapX(0) - 10} y={mapY(1) + 4} className="text-xs fill-gray-400 text-right" textAnchor="end">1</text>
    </>
  );

  // Math functions
  const getBaseY = (x: number, graphType: GraphType = type) => {
    switch (graphType) {
      case 'general':
        if (x < -4 || x > 4) return NaN;
        if (x < -2) return 2 * x + 6;
        if (x < 0) return -x;
        if (x < 2) return 1.5 * x;
        return -x + 5;
      case 'quadratic': return x * x;
      case 'exponential': return Math.pow(2, x); // Base 2 for reference
      case 'logarithmic': return Math.log2(x);
      case 'trigonometric': return Math.sin(x);
      default: return 0;
    }
  };

  const getTransformedY = (x: number, graphType: GraphType, graphParams: Params) => {
    const { a, b, h, k, reflectX, reflectY } = graphParams;
    
    let y = NaN;
    switch (graphType) {
      case 'general': {
        const effectiveB = reflectY ? -b : b;
        const effectiveA = reflectX ? -a : a;
        const mappedX = effectiveB * (x - h);
        const baseY = getBaseY(mappedX, graphType);
        if (!isNaN(baseY)) {
          y = effectiveA * baseY + k;
        }
        break;
      }
      case 'quadratic': {
        y = a * Math.pow(x - h, 2) + k;
        break;
      }
      case 'exponential': {
        y = Math.pow(a, x - h) + k;
        break;
      }
      case 'logarithmic': {
        if (a === 1) return NaN;
        if (x - h > 0) {
          y = Math.log(x - h) / Math.log(a) + k;
        }
        break;
      }
      case 'trigonometric': {
        y = a * Math.sin(b * (x - h)) + k;
        break;
      }
    }
    return y;
  };

  const generatePath = (fn: (x: number) => number) => {
    let path = '';
    let first = true;
    const step = (bounds.xMax - bounds.xMin) / 400;
    for (let x = bounds.xMin; x <= bounds.xMax; x += step) {
      const y = fn(x);
      if (isNaN(y) || !isFinite(y) || y > bounds.yMax + (bounds.yMax - bounds.yMin) || y < bounds.yMin - (bounds.yMax - bounds.yMin)) {
        first = true;
        continue;
      }
      const svgX = mapX(x);
      const svgY = mapY(y);
      if (first) {
        path += `M ${svgX} ${svgY} `;
        first = false;
      } else {
        path += `L ${svgX} ${svgY} `;
      }
    }
    return path;
  };

  const basePath = generatePath((x) => getBaseY(x, type));
  const transformedPath = generatePath((x) => getTransformedY(x, type, params));
  
  const savedPaths = savedGraphs.map(graph => ({
    id: graph.id,
    color: graph.color,
    path: generatePath((x) => getTransformedY(x, graph.type, graph.params))
  }));

  // Asymptotes
  let asymptotes = null;
  if (type === 'exponential') {
    const yAsymp = mapY(params.k);
    asymptotes = <line x1={0} x2={SVG_W} y1={yAsymp} y2={yAsymp} stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" />;
  } else if (type === 'logarithmic') {
    const xAsymp = mapX(params.h);
    asymptotes = <line x1={xAsymp} x2={xAsymp} y1={0} y2={SVG_H} stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" />;
  }

  // Vertex / Fixed Point
  let keyPoint = null;
  if (type === 'quadratic') {
    keyPoint = <circle cx={mapX(params.h)} cy={mapY(params.k)} r={5} fill="#2563eb" />;
  } else if (type === 'exponential') {
    keyPoint = <circle cx={mapX(params.h)} cy={mapY(1 + params.k)} r={5} fill="#2563eb" />;
  } else if (type === 'logarithmic') {
    keyPoint = <circle cx={mapX(1 + params.h)} cy={mapY(params.k)} r={5} fill="#2563eb" />;
  }

  // Pan & Zoom Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setLastPt({ x: e.clientX, y: e.clientY });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastPt.x;
    const dy = e.clientY - lastPt.y;
    const mathDx = dx * ((bounds.xMax - bounds.xMin) / SVG_W);
    const mathDy = dy * ((bounds.yMax - bounds.yMin) / SVG_H);
    setBounds(b => ({
      xMin: b.xMin - mathDx,
      xMax: b.xMax - mathDx,
      yMin: b.yMin + mathDy,
      yMax: b.yMax + mathDy
    }));
    setLastPt({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleWheel = (e: React.WheelEvent) => {
    const zoom = e.deltaY > 0 ? 1.1 : 0.9;
    setBounds(b => {
      const cx = (b.xMin + b.xMax) / 2;
      const cy = (b.yMin + b.yMax) / 2;
      const w = (b.xMax - b.xMin) * zoom;
      const h = (b.yMax - b.yMin) * zoom;
      return { xMin: cx - w/2, xMax: cx + w/2, yMin: cy - h/2, yMax: cy + h/2 };
    });
  };

  const zoomIn = () => setBounds(b => {
    const cx = (b.xMin + b.xMax) / 2;
    const cy = (b.yMin + b.yMax) / 2;
    const w = (b.xMax - b.xMin) * 0.8;
    const h = (b.yMax - b.yMin) * 0.8;
    return { xMin: cx - w/2, xMax: cx + w/2, yMin: cy - h/2, yMax: cy + h/2 };
  });

  const zoomOut = () => setBounds(b => {
    const cx = (b.xMin + b.xMax) / 2;
    const cy = (b.yMin + b.yMax) / 2;
    const w = (b.xMax - b.xMin) * 1.2;
    const h = (b.yMax - b.yMin) * 1.2;
    return { xMin: cx - w/2, xMax: cx + w/2, yMin: cy - h/2, yMax: cy + h/2 };
  });

  const resetView = () => {
    const ratio = SVG_H / SVG_W;
    setBounds({ xMin: -20, xMax: 20, yMin: -20 * ratio, yMax: 20 * ratio });
  };

  const pan = (dx: number, dy: number) => setBounds(b => {
    const w = b.xMax - b.xMin;
    const h = b.yMax - b.yMin;
    return {
      xMin: b.xMin + dx * w * 0.1,
      xMax: b.xMax + dx * w * 0.1,
      yMin: b.yMin + dy * h * 0.1,
      yMax: b.yMax + dy * h * 0.1
    };
  });

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <svg 
        width="100%" 
        height="100%" 
        viewBox={`0 0 ${SVG_W} ${SVG_H}`} 
        preserveAspectRatio="none" 
        className="bg-white rounded-lg touch-none cursor-move"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
      >
        {gridLines}
        {axes}
        {asymptotes}
        <path d={basePath} fill="none" stroke="#cbd5e1" strokeWidth={3} strokeDasharray="8 4" />
        {savedPaths.map(sp => (
          <path key={sp.id} d={sp.path} fill="none" stroke={sp.color} strokeWidth={2} opacity={0.8} />
        ))}
        <path d={transformedPath} fill="none" stroke="#2563eb" strokeWidth={3} />
        {keyPoint}
      </svg>

      {/* View Controls (Top Right) */}
      <div className="absolute z-10 top-2 right-2 md:top-4 md:right-4 bg-white/90 backdrop-blur p-1 rounded-lg shadow-sm border border-gray-200 flex flex-col gap-1">
        <button onClick={zoomIn} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded" title="Zoom In"><ZoomIn size={16} /></button>
        <button onClick={zoomOut} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded" title="Zoom Out"><ZoomOut size={16} /></button>
        <button onClick={resetView} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded" title="Reset View"><RefreshCcw size={16} /></button>
        <div className="h-px bg-gray-200 my-1"></div>
        <div className="grid grid-cols-3 gap-0.5">
          <div></div>
          <button onClick={() => pan(0, 1)} className="p-1 text-gray-600 hover:bg-gray-100 rounded flex justify-center"><ArrowUp size={14} /></button>
          <div></div>
          <button onClick={() => pan(-1, 0)} className="p-1 text-gray-600 hover:bg-gray-100 rounded flex justify-center"><ArrowLeft size={14} /></button>
          <div></div>
          <button onClick={() => pan(1, 0)} className="p-1 text-gray-600 hover:bg-gray-100 rounded flex justify-center"><ArrowRight size={14} /></button>
          <div></div>
          <button onClick={() => pan(0, -1)} className="p-1 text-gray-600 hover:bg-gray-100 rounded flex justify-center"><ArrowDown size={14} /></button>
          <div></div>
        </div>
      </div>

      {/* Saved Graphs Overlay (Bottom Left) */}
      {savedGraphs && savedGraphs.length > 0 && (
        <div className="absolute z-10 bottom-2 left-2 md:bottom-4 md:left-4 bg-white/90 backdrop-blur p-2 rounded-lg shadow-sm border border-gray-200 flex flex-col gap-1.5 max-h-[40%] overflow-y-auto w-auto max-w-[280px] md:max-w-[320px] scrollbar-hide pointer-events-auto">
          <div className="text-[10px] md:text-xs font-bold text-gray-700 mb-0.5">Saved Graphs</div>
          {savedGraphs.map(graph => (
            <div key={graph.id} className="flex items-center justify-between gap-2 bg-white/50 rounded p-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: graph.color }}></div>
                <div className="text-[10px] md:text-[11px] leading-tight break-words">
                  <EquationDisplay type={graph.type} params={graph.params} />
                </div>
              </div>
              {onRemoveSavedGraph && (
                <button onClick={() => onRemoveSavedGraph(graph.id)} className="text-gray-400 hover:text-red-500 p-0.5 shrink-0">
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Legend (Bottom Right) */}
      <div className="absolute z-10 bottom-2 right-12 md:bottom-4 md:right-4 bg-white/90 backdrop-blur px-2 py-1 md:px-3 md:py-2 rounded-lg shadow-sm border border-gray-200 flex flex-col gap-1 text-[10px] md:text-xs pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-slate-300 border-t-2 border-dashed border-slate-300"></div>
          <span className="text-slate-600">Base</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-blue-600"></div>
          <span className="text-slate-600">Transformed</span>
        </div>
        {(type === 'exponential' || type === 'logarithmic') && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-red-500 border-t-2 border-dashed border-red-500"></div>
            <span className="text-slate-600">Asymptote</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function EquationDisplay({ type, params, className = "text-slate-800" }: { type: GraphType, params: Params, className?: string }) {
  const { a, b, h, k, reflectX, reflectY } = params;
  
  const formatTerm = (val: number, isFirst: boolean = false) => {
    if (val === 0) return null;
    if (val > 0) return isFirst ? <>{val}</> : <> + {val}</>;
    return <> - {Math.abs(val)}</>;
  };

  const formatFactor = (val: number, isMultiplier: boolean = true) => {
    if (val === 1 && isMultiplier) return null;
    if (val === -1 && isMultiplier) return <>-</>;
    return <>{val}</>;
  };

  if (type === 'general') {
    let sign = reflectX ? '-' : '';
    let aStr = a !== 1 ? a : '';
    
    let inner = 'x';
    if (h !== 0) {
      inner = h > 0 ? `x - ${h}` : `x + ${Math.abs(h)}`;
    }
    
    let fullInner = inner;
    const hasB = b !== 1 || reflectY;
    if (hasB) {
      const bPrefix = `${reflectY ? '-' : ''}${b !== 1 ? b : ''}`;
      if (h !== 0) {
        fullInner = `${bPrefix}(${inner})`;
      } else {
        fullInner = `${bPrefix}x`;
      }
    }
    
    return <span className={`font-mono font-semibold ${className}`}>y = {sign}{aStr}f({fullInner}){formatTerm(k)}</span>;
  }
  
  if (type === 'quadratic') {
    let inner = h === 0 ? <>x<sup>2</sup></> : <>(x {h > 0 ? '-' : '+'} {Math.abs(h)})<sup>2</sup></>;
    return <span className={`font-mono font-semibold ${className}`}>y = {formatFactor(a)}{inner}{formatTerm(k)}</span>;
  }

  if (type === 'exponential') {
    let inner = h === 0 ? 'x' : `x ${h > 0 ? '-' : '+'} ${Math.abs(h)}`;
    return <span className={`font-mono font-semibold ${className}`}>y = {a}<sup>{inner}</sup>{formatTerm(k)}</span>;
  }

  if (type === 'logarithmic') {
    let inner = h === 0 ? 'x' : `x ${h > 0 ? '-' : '+'} ${Math.abs(h)}`;
    return <span className={`font-mono font-semibold ${className}`}>y = log<sub>{a}</sub>({inner}){formatTerm(k)}</span>;
  }

  if (type === 'trigonometric') {
    let inner = h === 0 ? 'x' : `x ${h > 0 ? '-' : '+'} ${Math.abs(h)}`;
    let bStr = b !== 1 ? b : '';
    let parens = '';
    if (h === 0) {
      parens = b === 1 ? '(x)' : `(${bStr}x)`;
    } else {
      parens = b === 1 ? `(${inner})` : `(${bStr}(${inner}))`;
    }
    return <span className={`font-mono font-semibold ${className}`}>y = {formatFactor(a)}sin{parens}{formatTerm(k)}</span>;
  }

  return <span className={`font-mono font-semibold ${className}`}>y = f(x)</span>;
}
