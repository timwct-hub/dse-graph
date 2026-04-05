import React, { useState } from 'react';
import Graph, { EquationDisplay } from './components/Graph';
import Controls from './components/Controls';
import Notes from './components/Notes';
import { GraphType, Params, SavedGraph } from './types';
import { FunctionSquare, LineChart, Activity, Waves, Menu, X, Settings2 } from 'lucide-react';

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isControlsOpen, setIsControlsOpen] = useState(false);

  const handleTypeChange = (type: GraphType) => {
    setGraphType(type);
    if (type === 'exponential' || type === 'logarithmic') {
      setParams({ a: 2, b: 1, h: 0, k: 0, reflectX: false, reflectY: false });
    } else {
      setParams({ a: 1, b: 1, h: 0, k: 0, reflectX: false, reflectY: false });
    }
    setIsMenuOpen(false);
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
      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors w-full ${
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
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar / Top Nav */}
      <div className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col shadow-sm z-30 shrink-0">
        <div className="p-4 md:p-6 flex justify-between items-center md:block bg-white relative z-20">
          <div className="text-lg md:text-xl font-bold tracking-tight bg-blue-50/50 px-3 py-1.5 rounded-lg border border-blue-100 inline-block">
            <EquationDisplay type={graphType} params={params} className="text-blue-600" />
          </div>
          <button className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        <nav className={`${isMenuOpen ? 'flex' : 'hidden'} md:flex flex-col p-4 gap-2 absolute md:relative top-[73px] md:top-0 left-0 w-full md:w-auto bg-white border-b md:border-none shadow-lg md:shadow-none z-10 max-h-[calc(100vh-73px)] overflow-y-auto`}>
          <NavItem active={graphType === 'general'} onClick={() => handleTypeChange('general')} icon={<FunctionSquare size={18} />} label="General 通用變換" />
          <NavItem active={graphType === 'quadratic'} onClick={() => handleTypeChange('quadratic')} icon={<LineChart size={18} />} label="Quadratic 二次函數" />
          <NavItem active={graphType === 'exponential'} onClick={() => handleTypeChange('exponential')} icon={<Activity size={18} />} label="Exponential 指數函數" />
          <NavItem active={graphType === 'logarithmic'} onClick={() => handleTypeChange('logarithmic')} icon={<Activity size={18} className="transform rotate-90" />} label="Logarithmic 對數函數" />
          <NavItem active={graphType === 'trigonometric'} onClick={() => handleTypeChange('trigonometric')} icon={<Waves size={18} />} label="Trigonometric 三角函數" />
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="flex-1 flex flex-col lg:flex-row p-0 md:p-6 gap-0 md:gap-6 overflow-hidden">
          {/* Graph Area */}
          <div className="flex-1 bg-white md:rounded-xl shadow-sm md:border border-slate-200 p-0 md:p-6 flex flex-col items-center justify-center relative h-full">
             <Graph type={graphType} params={params} savedGraphs={savedGraphs} onRemoveSavedGraph={removeSavedGraph} />
             
             {/* Mobile Floating Button */}
             <button 
               className={`lg:hidden fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-xl z-20 hover:bg-blue-700 transition-all duration-300 flex items-center justify-center ${isControlsOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
               onClick={() => setIsControlsOpen(true)}
             >
               <Settings2 size={24} />
             </button>
          </div>

          {/* Controls Area */}
          <div className={`
            fixed lg:relative inset-0 lg:inset-auto
            w-full lg:w-[340px] 
            h-full lg:h-auto lg:max-h-none
            bg-white/60 lg:bg-white lg:rounded-xl shadow-[0_-15px_40px_rgba(0,0,0,0.15)] lg:shadow-sm border-t lg:border border-slate-200 
            p-4 md:p-6 flex flex-col overflow-y-auto shrink-0 z-40
            transition-transform duration-300 ease-in-out
            ${isControlsOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}
          `}>
             <div className="flex justify-between items-center lg:hidden mb-4 pb-2 sticky top-0 bg-transparent z-10 pt-4">
               <h2 className="font-bold text-gray-800 text-lg drop-shadow-md">Controls</h2>
               <button onClick={() => setIsControlsOpen(false)} className="p-2 text-gray-800 hover:bg-white/80 rounded-full bg-white/60"><X size={24}/></button>
             </div>
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
