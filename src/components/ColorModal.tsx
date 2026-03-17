import React from 'react';
import { X, Palette, Sun, Moon } from 'lucide-react';

const presets = [
  { name: 'Neutral', colors: ['#737373', '#3b82f6', '#0ea5e9', '#06b6d4'] },
  { name: 'Gray', colors: ['#9ca3af', '#60a5fa', '#a855f7', '#ec4899'] },
  { name: 'Stone', colors: ['#a8a29e', '#f97316', '#ef4444', '#f43f5e'] },
  { name: 'Slate', colors: ['#94a3b8', '#06b6d4', '#10b981', '#f59e0b'] },
  { name: 'Indigo', colors: ['#818cf8', '#6366f1', '#3b82f6', '#22c55e'] },
  { name: 'Blue', colors: ['#60a5fa', '#3b82f6', '#0ea5e9', '#eab308'] },
  { name: 'Orange', colors: ['#fb923c', '#f97316', '#eab308', '#22c55e'] },
  { name: 'Green', colors: ['#34d399', '#10b981', '#3b82f6', '#818cf8'] },
];

const filters = ['All', 'Color', 'Gradient', 'Text', 'Background', 'Border', 'Hover'];

interface ColorModalProps {
  onClose: () => void;
  onSelectColor: (color: string) => void;
}

export default function ColorModal({ onClose, onSelectColor }: ColorModalProps) {
  return (
    <div className="absolute top-16 right-4 bottom-4 w-80 bg-[#171717] border border-neutral-800 rounded-xl shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between p-4 border-b border-neutral-800">
        <h2 className="text-sm font-semibold text-white tracking-wide uppercase">Colors</h2>
        <button onClick={onClose} className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full transition-colors">
          <X size={16} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        <div className="mb-6">
          <h3 className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mb-3">Mode</h3>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => onSelectColor('Light Mode')}
              className="flex items-center justify-center gap-2 px-4 py-2 text-xs text-white bg-[#1a1a1a] border border-neutral-800 rounded-lg hover:border-neutral-600 transition-all"
            >
              <Sun size={14} className="text-neutral-400" /> Light
            </button>
            <button 
              onClick={() => onSelectColor('Dark Mode')}
              className="flex items-center justify-center gap-2 px-4 py-2 text-xs text-white bg-[#1a1a1a] border border-neutral-800 rounded-lg hover:border-neutral-600 transition-all"
            >
              <Moon size={14} className="text-neutral-400" /> Dark
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mb-3">Presets</h3>
          <div className="grid grid-cols-2 gap-2">
            {presets.map((preset, i) => (
              <button 
                key={i} 
                onClick={() => {
                  onSelectColor(`the ${preset.name} theme palette: ${preset.colors.join(', ')}`);
                  onClose();
                }}
                className="flex flex-col p-3 bg-[#1a1a1a] border border-neutral-800 rounded-lg hover:border-neutral-600 hover:bg-neutral-800/50 text-left transition-all"
              >
                <div className="flex gap-1 mb-2">
                  {preset.colors.map((c, j) => (
                    <div key={j} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }}></div>
                  ))}
                </div>
                <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-tight">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mb-3">Filters</h3>
          <div className="flex flex-wrap gap-1.5">
            {filters.map((filter, i) => (
              <button key={i} className={`px-3 py-1 rounded-full text-[10px] font-medium border transition-colors ${
                filter === 'All' 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                  : 'bg-[#1a1a1a] text-neutral-400 border-neutral-800 hover:border-neutral-600'
              }`}>
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
