import React, { useState } from 'react';
import { X, Search, Check, ChevronDown, Image as ImageIcon, Play, PanelRightClose } from 'lucide-react';

interface SelectionAssetsPanelProps {
  onClose: () => void;
  onCollapse: () => void;
}

export default function SelectionAssetsPanel({ onClose, onCollapse }: SelectionAssetsPanelProps) {
  const [activeTab, setActiveTab] = useState('BACKGROUND');
  const [bgTab, setBgTab] = useState('Embed');
  const [customUrlTab, setCustomUrlTab] = useState('Spline');
  const [urlInput, setUrlInput] = useState('');

  return (
    <div className="w-[320px] bg-[#0f0f0f] border-l border-neutral-800 flex flex-col h-full shrink-0 text-xs z-30">
      <div className="p-4 border-b border-neutral-800 font-medium text-white flex items-center justify-between">
        <span className="text-[10px] tracking-wider font-semibold text-neutral-400">SELECTION ASSETS</span>
        <div className="flex items-center gap-2">
          <button 
            onClick={onCollapse}
            className="p-1 hover:bg-neutral-800 rounded transition-colors text-neutral-400 hover:text-white"
            title="Collapse Panel"
          >
            <PanelRightClose size={14} />
          </button>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="flex border-b border-neutral-800">
        {['BACKGROUND', 'COMPONENTS', 'CUSTOM URL'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-center text-[10px] font-semibold tracking-wider transition-colors border-b-2 ${
              activeTab === tab 
                ? 'border-white text-white' 
                : 'border-transparent text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-6">
        {activeTab === 'BACKGROUND' && (
          <>
            <div className="flex bg-[#1a1a1a] rounded-lg p-1 border border-neutral-800">
              {['Embed', 'Video', 'Image'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setBgTab(tab)}
                  className={`flex-1 py-1.5 text-center rounded-md transition-colors ${
                    bgTab === tab 
                      ? 'bg-neutral-800 text-white shadow-sm' 
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex items-start gap-2 text-neutral-500 text-[10px] leading-relaxed">
              <Play size={12} className="shrink-0 mt-0.5" />
              <p>Animated backgrounds will only appear when Play is active</p>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-neutral-600 gap-2 min-h-[200px]">
              <ImageIcon size={24} className="opacity-50" />
              <p>No images detected</p>
            </div>
          </>
        )}

        {activeTab === 'COMPONENTS' && (
          <>
            <div className="flex items-center justify-between">
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1a] border border-neutral-800 rounded-lg text-neutral-300 hover:text-white transition-colors">
                Popular <ChevronDown size={12} />
              </button>
              <button className="text-neutral-400 hover:text-white transition-colors">
                Show All
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="aspect-square bg-[#1a1a1a] border border-neutral-800 rounded-lg hover:border-neutral-600 transition-colors cursor-pointer flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-neutral-800/50"></div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'CUSTOM URL' && (
          <>
            <div className="flex bg-[#1a1a1a] rounded-lg p-1 border border-neutral-800">
              {['Spline', 'Unicorn'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setCustomUrlTab(tab)}
                  className={`flex-1 py-1.5 text-center rounded-md transition-colors ${
                    customUrlTab === tab 
                      ? 'bg-neutral-800 text-white shadow-sm' 
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[#1a1a1a] border border-neutral-800 rounded-lg flex items-center px-3 py-2 focus-within:border-neutral-600 transition-colors">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://..."
                  className="bg-transparent w-full outline-none text-white placeholder-neutral-600"
                />
              </div>
              <button className="p-2 bg-emerald-600/20 text-emerald-500 rounded-lg hover:bg-emerald-600/30 transition-colors">
                <Check size={14} />
              </button>
              <button className="p-2 bg-red-600/20 text-red-500 rounded-lg hover:bg-red-600/30 transition-colors">
                <X size={14} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
