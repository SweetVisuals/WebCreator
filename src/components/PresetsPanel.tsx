import React, { useState } from 'react';
import { ChevronDown, PanelRightClose } from 'lucide-react';

interface PresetsPanelProps {
  onCollapse: () => void;
  selectedElement: { selector: string; content: string } | null;
  onApplyDesignChange: (prompt: string) => void;
  onInstantDesignChange: (type: 'font' | 'color' | 'text' | 'background' | 'corner' | 'shadow' | 'image', value: string) => void;
  isGenerating: boolean;
}

export default function PresetsPanel({ onCollapse, selectedElement, onApplyDesignChange, onInstantDesignChange, isGenerating }: PresetsPanelProps) {
  const [activeAesthetic, setActiveAesthetic] = useState('Dark');
  const [activeLayout, setActiveLayout] = useState('Desktop');
  
  const aesthetics = ['Light', 'Dark', 'Image Light', 'Image Dark'];
  const layouts = [
    'Desktop', 'Desktop 2', 'Desktop 3', 'Desktop 4', 'Desktop 5',
    'Devices', '3D', 'Mockup', 'iPhone', 'Laptop', 'iPad', 'Android',
    'Card', 'Landscape', 'Portrait', 'Angle'
  ];

  const getElementType = () => {
    if (!selectedElement) return 'Page';
    const tag = selectedElement.selector.split('.')[0].split('#')[0].toLowerCase();
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) return 'Heading';
    if (tag === 'p' || tag === 'span') return 'Text';
    if (tag === 'button' || tag === 'a') return 'Button';
    if (tag === 'img') return 'Image';
    if (tag === 'div' || tag === 'section' || tag === 'nav' || tag === 'footer') return 'Container';
    return 'Element';
  };

  const elementType = getElementType();

  return (
    <div className="w-[280px] bg-[#0f0f0f] border-l border-neutral-800 flex flex-col h-full shrink-0 overflow-y-auto custom-scrollbar text-xs">
      <div className="p-4 border-b border-neutral-800 font-medium text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>{selectedElement ? 'Settings' : 'Presets'}</span>
          {isGenerating && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>}
        </div>
        <button 
          onClick={onCollapse}
          className="p-1 hover:bg-neutral-800 rounded transition-colors text-neutral-400 hover:text-white"
          title="Collapse Panel"
        >
          <PanelRightClose size={14} />
        </button>
      </div>
      
      <div className="p-4 flex flex-col gap-6">
        {selectedElement ? (
          <>
            {/* ELEMENT CONTEXT */}
            <div className="flex flex-col gap-2 p-3 bg-[#171717] border border-neutral-800 rounded-lg">
              <div className="text-[10px] font-semibold text-neutral-500 tracking-wider uppercase">{elementType} Selected</div>
              <div className="text-[10px] font-mono text-neutral-400 truncate">{selectedElement.selector}</div>
            </div>

            {/* CONTEXT SPECIFIC SETTINGS */}
            <div className="flex flex-col gap-4">
              <div className="text-[10px] font-semibold text-neutral-500 tracking-wider uppercase">Properties</div>
              
              {elementType === 'Button' && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Label</span>
                    <input 
                      type="text" 
                      className="bg-[#171717] border border-neutral-800 rounded px-2 py-1 w-32 text-neutral-300 outline-none focus:border-neutral-600"
                      placeholder="Button Text"
                      onBlur={(e) => onInstantDesignChange('text', e.target.value)}
                    />
                  </div>
                </>
              )}

              {elementType === 'Image' && (
                <>
                  <div className="flex flex-col gap-2">
                    <span className="text-neutral-400">Source URL</span>
                    <input 
                      type="text" 
                      className="bg-[#171717] border border-neutral-800 rounded px-2 py-1 w-full text-neutral-300 outline-none focus:border-neutral-600"
                      placeholder="https://..."
                      onBlur={(e) => onInstantDesignChange('image', e.target.value)}
                    />
                  </div>
                </>
              )}

              {(elementType === 'Heading' || elementType === 'Text') && (
                <>
                  <div className="flex flex-col gap-2">
                    <span className="text-neutral-400">Content</span>
                    <textarea 
                      className="bg-[#171717] border border-neutral-800 rounded px-2 py-1 w-full h-20 text-neutral-300 outline-none focus:border-neutral-600 resize-none"
                      onBlur={(e) => onInstantDesignChange('text', e.target.value)}
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Background</span>
                <div className="flex items-center gap-2 bg-[#171717] border border-neutral-800 rounded px-2 py-1 w-32">
                  <div className="w-3 h-3 rounded-sm bg-neutral-700 border border-neutral-600"></div>
                  <input 
                    type="text" 
                    placeholder="#000000"
                    className="bg-transparent w-full outline-none text-neutral-300" 
                    onBlur={(e) => onInstantDesignChange('background', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Corner</span>
                <input 
                  type="range" 
                  min="0" max="24"
                  className="w-32 accent-blue-500" 
                  onChange={(e) => onInstantDesignChange('corner', e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Shadow</span>
                <select 
                  className="bg-[#171717] border border-neutral-800 rounded px-2 py-1 w-32 text-neutral-300 outline-none"
                  onChange={(e) => onInstantDesignChange('shadow', e.target.value)}
                >
                  <option value="none">None</option>
                  <option value="sm">Small</option>
                  <option value="md">Medium</option>
                  <option value="lg">Large</option>
                  <option value="xl">Extra Large</option>
                </select>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-900/20 border border-blue-800/30 rounded-lg">
              <p className="text-[10px] text-blue-300 leading-relaxed">
                Changes applied here will update the code globally where applicable.
              </p>
            </div>
          </>
        ) : (
          <>
            {/* AESTHETIC */}
            <div className="flex flex-col gap-3">
              <div className="text-[10px] font-semibold text-neutral-500 tracking-wider">AESTHETIC</div>
              <div className="grid grid-cols-2 gap-2">
                {aesthetics.map(a => (
                  <button
                    key={a}
                    onClick={() => {
                      setActiveAesthetic(a);
                      onApplyDesignChange(`Apply a ${a} aesthetic to the entire website.`);
                    }}
                    className={`py-1.5 px-2 rounded border text-center transition-colors ${
                      activeAesthetic === a 
                        ? 'bg-neutral-800 border-neutral-700 text-white' 
                        : 'bg-[#171717] border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* LAYOUT */}
            <div className="flex flex-col gap-3">
              <div className="text-[10px] font-semibold text-neutral-500 tracking-wider">LAYOUT</div>
              <div className="grid grid-cols-2 gap-2">
                {layouts.map(l => (
                  <button
                    key={l}
                    onClick={() => {
                      setActiveLayout(l);
                      onApplyDesignChange(`Change the layout of the website to a ${l} style.`);
                    }}
                    className={`py-1.5 px-2 rounded border text-center transition-colors ${
                      activeLayout === l 
                        ? 'bg-neutral-800 border-neutral-700 text-white' 
                        : 'bg-[#171717] border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
