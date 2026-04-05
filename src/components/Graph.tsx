import React from 'react';
import { GraphType, Params, SavedGraph } from '../types';

const SVG_SIZE = 600;
const RANGE = 10; // -10 to 10

const mapX = (x: number) => ((x + RANGE) / (RANGE * 2)) * SVG_SIZE;
const mapY = (y: number) => ((RANGE - y) / (RANGE * 2)) * SVG_SIZE;

interface Props {
  type: GraphType;
  params: Params;
  savedGraphs?: SavedGraph[];
}

export default function Graph({ type, params, savedGraphs = [] }: Props) {
  // Generate grid lines
  const gridLines = [];
  for (let i = -RANGE; i <= RANGE; i++) {
    gridLines.push(<line key={`v${i}`} x1={mapX(i)} x2={mapX(i)} y1={0} y2={SVG_SIZE} stroke="#f1f5f9" strokeWidth={i === 0 ? 2 : 1} strokeDasharray={i !== 0 && i % 5 === 0 ? "4 4" : "none"} />);
    gridLines.push(<line key={`h${i}`} x1={0} x2={SVG_SIZE} y1={mapY(i)} y2={mapY(i)} stroke="#f1f5f9" strokeWidth={i === 0 ? 2 : 1} strokeDasharray={i !== 0 && i % 5 === 0 ? "4 4" : "none"} />);
  }

  // Axes
  const axes = (
    <>
      <line x1={0} x2={SVG_SIZE} y1={mapY(0)} y2={mapY(0)} stroke="#94a3b8" strokeWidth={2} />
      <line x1={mapX(0)} x2={mapX(0)} y1={0} y2={SVG_SIZE} stroke="#94a3b8" strokeWidth={2} />
      {/* Labels */}
      <text x={SVG_SIZE - 15} y={mapY(0) - 10} className="text-sm fill-gray-500 font-mono">x</text>
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
    const step = 0.05;
    for (let x = -RANGE; x <= RANGE; x += step) {
      const y = fn(x);
      if (isNaN(y) || !isFinite(y) || y > RANGE * 2 || y < -RANGE * 2) {
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
    asymptotes = <line x1={0} x2={SVG_SIZE} y1={yAsymp} y2={yAsymp} stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" />;
  } else if (type === 'logarithmic') {
    const xAsymp = mapX(params.h);
    asymptotes = <line x1={xAsymp} x2={xAsymp} y1={0} y2={SVG_SIZE} stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" />;
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

  return (
    <div className="relative w-full max-w-[600px] aspect-square">
      <svg width="100%" height="100%" viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} className="bg-white rounded-lg">
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
      
      {/* Equation Display Overlay */}
      <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-white/90 backdrop-blur px-2 py-1 md:px-4 md:py-2 rounded-lg shadow-sm border border-gray-200 scale-75 md:scale-100 origin-top-left">
        <EquationDisplay type={type} params={params} />
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 bg-white/90 backdrop-blur px-2 py-1 md:px-3 md:py-2 rounded-lg shadow-sm border border-gray-200 flex flex-col gap-1 text-[10px] md:text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-slate-300 border-t-2 border-dashed border-slate-300"></div>
          <span className="text-slate-600">Base 原始圖表</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-blue-600"></div>
          <span className="text-slate-600">Transformed 變化後</span>
        </div>
        {(type === 'exponential' || type === 'logarithmic') && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-red-500 border-t-2 border-dashed border-red-500"></div>
            <span className="text-slate-600">Asymptote 漸近線</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function EquationDisplay({ type, params }: { type: GraphType, params: Params }) {
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
    
    return <span className="font-mono text-lg font-semibold text-slate-800">y = {sign}{aStr}f({fullInner}){formatTerm(k)}</span>;
  }
  
  if (type === 'quadratic') {
    let inner = h === 0 ? <>x<sup>2</sup></> : <>(x {h > 0 ? '-' : '+'} {Math.abs(h)})<sup>2</sup></>;
    return <span className="font-mono text-lg font-semibold text-slate-800">y = {formatFactor(a)}{inner}{formatTerm(k)}</span>;
  }

  if (type === 'exponential') {
    let inner = h === 0 ? 'x' : `x ${h > 0 ? '-' : '+'} ${Math.abs(h)}`;
    return <span className="font-mono text-lg font-semibold text-slate-800">y = {a}<sup>{inner}</sup>{formatTerm(k)}</span>;
  }

  if (type === 'logarithmic') {
    let inner = h === 0 ? 'x' : `x ${h > 0 ? '-' : '+'} ${Math.abs(h)}`;
    return <span className="font-mono text-lg font-semibold text-slate-800">y = log<sub>{a}</sub>({inner}){formatTerm(k)}</span>;
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
    return <span className="font-mono text-lg font-semibold text-slate-800">y = {formatFactor(a)}sin{parens}{formatTerm(k)}</span>;
  }

  return <span>y = f(x)</span>;
}
