import React from 'react';
import { GraphType, Params, SavedGraph } from '../types';
import { Plus } from 'lucide-react';

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
    <div className="mb-2.5">
      <div className="flex justify-between items-end mb-1">
        <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
          <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-[10px] font-mono">{label}</span>
          <span className="text-gray-500 text-[10px] w-6">{params[paramKey as keyof Params]}</span>
        </label>
        <div className="text-[9px] text-gray-400 leading-tight text-right">
          {descEn} {descZh}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={params[paramKey as keyof Params] as number}
        onChange={(e) => {
          let val = parseFloat(e.target.value);
          update(paramKey, val);
        }}
        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
    </div>
  );

  const Toggle = ({ label, paramKey, descEn, descZh }: any) => (
    <div className="mb-2.5 flex items-center justify-between">
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-gray-700">{label}</span>
        <span className="text-[9px] text-gray-400">{descEn} {descZh}</span>
      </div>
      <label className="flex items-center cursor-pointer">
        <div className="relative">
          <input
            type="checkbox"
            className="sr-only"
            checked={params[paramKey as keyof Params] as boolean}
            onChange={(e) => update(paramKey, e.target.checked)}
          />
          <div className={`block w-8 h-4 rounded-full transition-colors ${params[paramKey as keyof Params] ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
          <div className={`absolute left-0.5 top-0.5 bg-white w-3 h-3 rounded-full transition-transform ${params[paramKey as keyof Params] ? 'transform translate-x-4' : ''}`}></div>
        </div>
      </label>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-3 border-b pb-2">
        <h2 className="text-sm font-bold text-gray-800">Parameters 參數</h2>
        <button 
          onClick={onAddSavedGraph}
          className="flex items-center gap-1 bg-blue-100 text-blue-700 hover:bg-blue-200 px-2 py-1 rounded text-[10px] font-medium transition-colors"
        >
          <Plus size={12} />
          <span>Pin Graph</span>
        </button>
      </div>
      
      {type === 'general' && (
        <>
          <Slider label="k" paramKey="k" min={-10} max={10} step={0.1} descEn="Vertical Shift" descZh="垂直平移" />
          <Slider label="h" paramKey="h" min={-10} max={10} step={0.1} descEn="Horizontal Shift" descZh="水平平移" />
          <Slider label="a" paramKey="a" min={-10} max={10} step={0.1} descEn="Vertical Stretch" descZh="垂直拉伸/壓縮" />
          <Slider label="b" paramKey="b" min={-10} max={10} step={0.1} descEn="Horizontal Stretch" descZh="水平拉伸/壓縮" />
          <Toggle label="-f(x)" paramKey="reflectX" descEn="Reflect in x-axis" descZh="沿 x-軸反射" />
          <Toggle label="f(-x)" paramKey="reflectY" descEn="Reflect in y-axis" descZh="沿 y-軸反射" />
        </>
      )}

      {type === 'quadratic' && (
        <>
          <Slider label="a" paramKey="a" min={-10} max={10} step={0.1} descEn="Opening & Width" descZh="開口方向與闊度" />
          <Slider label="h" paramKey="h" min={-10} max={10} step={0.1} descEn="Vertex x" descZh="頂點 x" />
          <Slider label="k" paramKey="k" min={-10} max={10} step={0.1} descEn="Vertex y" descZh="頂點 y" />
        </>
      )}

      {type === 'exponential' && (
        <>
          <Slider label="a" paramKey="a" min={0.1} max={10} step={0.1} descEn="Base" descZh="底數" />
          <Slider label="h" paramKey="h" min={-10} max={10} step={0.1} descEn="Horizontal Shift" descZh="水平平移" />
          <Slider label="k" paramKey="k" min={-10} max={10} step={0.1} descEn="Vertical Shift" descZh="垂直平移" />
        </>
      )}

      {type === 'logarithmic' && (
        <>
          <Slider label="a" paramKey="a" min={0.1} max={10} step={0.1} descEn="Base" descZh="底數" />
          <Slider label="h" paramKey="h" min={-10} max={10} step={0.1} descEn="Horizontal Shift" descZh="水平平移" />
          <Slider label="k" paramKey="k" min={-10} max={10} step={0.1} descEn="Vertical Shift" descZh="垂直平移" />
        </>
      )}

      {type === 'trigonometric' && (
        <>
          <Slider label="a" paramKey="a" min={-10} max={10} step={0.1} descEn="Amplitude" descZh="振幅" />
          <Slider label="b" paramKey="b" min={-10} max={10} step={0.1} descEn="Period mod" descZh="週期改變" />
          <Slider label="h" paramKey="h" min={-10} max={10} step={0.1} descEn="Phase Shift" descZh="相位移動" />
          <Slider label="k" paramKey="k" min={-10} max={10} step={0.1} descEn="Vertical Shift" descZh="垂直平移" />
        </>
      )}
    </div>
  );
}
