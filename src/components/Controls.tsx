import React from 'react';
import { GraphType, Params, SavedGraph } from '../types';
import { EquationDisplay } from './Graph';
import { Plus, X } from 'lucide-react';

interface Props {
  type: GraphType;
  params: Params;
  onChange: (params: Params) => void;
  savedGraphs: SavedGraph[];
  onAddSavedGraph: () => void;
  onRemoveSavedGraph: (id: string) => void;
}

export default function Controls({ type, params, onChange, savedGraphs, onAddSavedGraph, onRemoveSavedGraph }: Props) {
  const update = (key: keyof Params, value: any) => {
    onChange({ ...params, [key]: value });
  };

  const Slider = ({ label, paramKey, min, max, step = 1, descEn, descZh }: any) => (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-mono">{label}</span>
          <span className="text-gray-500 text-xs">{params[paramKey as keyof Params]}</span>
        </label>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={params[paramKey as keyof Params] as number}
        onChange={(e) => {
          let val = parseFloat(e.target.value);
          if ((type === 'exponential' || type === 'logarithmic') && paramKey === 'a' && val === 1) {
            val = 1.2; // Skip 1 for base
          }
          if (type === 'quadratic' && paramKey === 'a' && val === 0) {
            val = 0.5; // Skip 0 for quadratic
          }
          update(paramKey, val);
        }}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
      <div className="flex flex-col mt-1">
        <span className="text-xs text-gray-600">{descEn}</span>
        <span className="text-xs text-gray-400">{descZh}</span>
      </div>
    </div>
  );

  const Toggle = ({ label, paramKey, descEn, descZh }: any) => (
    <div className="mb-5">
      <label className="flex items-center cursor-pointer group">
        <div className="relative">
          <input
            type="checkbox"
            className="sr-only"
            checked={params[paramKey as keyof Params] as boolean}
            onChange={(e) => update(paramKey, e.target.checked)}
          />
          <div className={`block w-10 h-6 rounded-full transition-colors ${params[paramKey as keyof Params] ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
          <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${params[paramKey as keyof Params] ? 'transform translate-x-4' : ''}`}></div>
        </div>
        <div className="ml-3 flex flex-col">
          <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">{label}</span>
          <span className="text-xs text-gray-500">{descEn} / {descZh}</span>
        </div>
      </label>
    </div>
  );

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Parameters 參數控制</h2>
      
      {type === 'general' && (
        <>
          <Slider label="k" paramKey="k" min={-5} max={5} descEn="Vertical Shift" descZh="垂直平移" />
          <Slider label="h" paramKey="h" min={-5} max={5} descEn="Horizontal Shift" descZh="水平平移" />
          <Slider label="a" paramKey="a" min={0.5} max={3} step={0.5} descEn="Vertical Stretch" descZh="垂直拉伸/壓縮" />
          <Slider label="b" paramKey="b" min={0.5} max={3} step={0.5} descEn="Horizontal Stretch" descZh="水平拉伸/壓縮" />
          <Toggle label="-f(x)" paramKey="reflectX" descEn="Reflect in x-axis" descZh="沿 x-軸反射" />
          <Toggle label="f(-x)" paramKey="reflectY" descEn="Reflect in y-axis" descZh="沿 y-軸反射" />
        </>
      )}

      {type === 'quadratic' && (
        <>
          <Slider label="a" paramKey="a" min={-3} max={3} step={0.5} descEn="Opening & Width" descZh="開口方向與闊度" />
          <Slider label="h" paramKey="h" min={-5} max={5} descEn="Vertex x-coordinate" descZh="頂點 x 坐標" />
          <Slider label="k" paramKey="k" min={-5} max={5} descEn="Vertex y-coordinate" descZh="頂點 y 坐標" />
        </>
      )}

      {type === 'exponential' && (
        <>
          <Slider label="a (Base)" paramKey="a" min={0.2} max={4} step={0.2} descEn="Base (Growth/Decay)" descZh="底數 (增長/衰減)" />
          <Slider label="h" paramKey="h" min={-5} max={5} descEn="Horizontal Shift" descZh="水平平移" />
          <Slider label="k" paramKey="k" min={-5} max={5} descEn="Vertical Shift (Asymptote)" descZh="垂直平移 (漸近線)" />
        </>
      )}

      {type === 'logarithmic' && (
        <>
          <Slider label="a (Base)" paramKey="a" min={0.2} max={4} step={0.2} descEn="Base" descZh="底數" />
          <Slider label="h" paramKey="h" min={-5} max={5} descEn="Horizontal Shift (Asymptote)" descZh="水平平移 (漸近線)" />
          <Slider label="k" paramKey="k" min={-5} max={5} descEn="Vertical Shift" descZh="垂直平移" />
        </>
      )}

      {type === 'trigonometric' && (
        <>
          <Slider label="a" paramKey="a" min={-3} max={3} step={0.5} descEn="Amplitude" descZh="振幅" />
          <Slider label="b" paramKey="b" min={0.5} max={4} step={0.5} descEn="Period modifier" descZh="週期改變" />
          <Slider label="h" paramKey="h" min={-3} max={3} step={0.5} descEn="Phase Shift" descZh="相位移動" />
          <Slider label="k" paramKey="k" min={-5} max={5} descEn="Vertical Shift" descZh="垂直平移" />
        </>
      )}

      <div className="mt-8 border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Saved Graphs 已存圖表</h2>
          <button 
            onClick={onAddSavedGraph}
            className="flex items-center gap-1 bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            <span>Pin</span>
          </button>
        </div>
        
        {savedGraphs.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No saved graphs yet. Click Pin to add the current graph.</p>
        ) : (
          <div className="space-y-3">
            {savedGraphs.map(graph => (
              <div key={graph.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: graph.color }}></div>
                  <div className="truncate text-sm scale-90 origin-left">
                    <EquationDisplay type={graph.type} params={graph.params} />
                  </div>
                </div>
                <button 
                  onClick={() => onRemoveSavedGraph(graph.id)}
                  className="text-gray-400 hover:text-red-500 p-1 shrink-0 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
