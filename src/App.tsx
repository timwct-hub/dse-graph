import React, { useState } from 'react';
import Graph from './components/Graph';
import Controls from './components/Controls';
import Notes from './components/Notes';
import { GraphType, Params, SavedGraph } from './types';
import { FunctionSquare, LineChart, Activity, Waves } from 'lucide-react';

const COLORS = ['#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f43f5e'];

export default function App() {
  const [graphType, setGraphType] = useState<GraphType>('general');
  const [params, setParams] = useState<Params>({
    a: 1,
    b: 1,
    h: 0,
    k: 0,
    reflectX: false,
    reflectY: false,
  });
  const [savedGraphs, setSavedGraphs] = useState<SavedGraph[]>([]);

  const handleTypeChange = (type: GraphType) => {
    setGraphType(type);
    if (type === 'exponential' || type === 'logarithmic') {
      setParams({ a: 2, b: 1, h: 0, k: 0, reflectX: false, reflectY: false });
    } else {
      setParams({ a: 1, b: 1, h: 0, k: 0, reflectX: false, reflectY: false });
    }
  };

  const addSavedGraph = () => {
    const color = COLORS[savedGraphs.length % COLORS.length];
    setSavedGraphs([...savedGraphs, { id: Date.now().toString(), type: graphType, params: { ...params }, color }]);
  };

  const removeSavedGraph = (id: string) => {
    setSavedGraphs(savedGraphs.filter(g => g.id !== id));
  };

  const NavItem = ({ active, onClick, icon, label }: any) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
        active 
          ? 'bg-blue-50 text-blue-700' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-xl font-bold text-blue-600 tracking-tight">HKDSE Graphs</h1>
          <p className="text-xs text-slate-500 mt-1">Transformations 1-Page Note</p>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavItem active={graphType === 'general'} onClick={() => handleTypeChange('general')} icon={<FunctionSquare size={18} />} label="General 通用變換" />
          <NavItem active={graphType === 'quadratic'} onClick={() => handleTypeChange('quadratic')} icon={<LineChart size={18} />} label="Quadratic 二次函數" />
          <NavItem active={graphType === 'exponential'} onClick={() => handleTypeChange('exponential')} icon={<Activity size={18} />} label="Exponential 指數函數" />
          <NavItem active={graphType === 'logarithmic'} onClick={() => handleTypeChange('logarithmic')} icon={<Activity size={18} className="transform rotate-90" />} label="Logarithmic 對數函數" />
          <NavItem active={graphType === 'trigonometric'} onClick={() => handleTypeChange('trigonometric')} icon={<Waves size={18} />} label="Trigonometric 三角函數" />
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex p-6 gap-6 overflow-auto">
          {/* Graph Area */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center min-w-[500px]">
             <Graph type={graphType} params={params} savedGraphs={savedGraphs} />
          </div>

          {/* Controls Area */}
          <div className="w-[340px] bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col overflow-y-auto shrink-0">
             <Controls 
               type={graphType} 
               params={params} 
               onChange={setParams} 
               savedGraphs={savedGraphs}
               onAddSavedGraph={addSavedGraph}
               onRemoveSavedGraph={removeSavedGraph}
             />
             <Notes type={graphType} />
          </div>
        </div>
      </div>
    </div>
  );
}
