import React from 'react';
import { X } from 'lucide-react';

const importedFonts = [
  'Geist', 'Roboto', 'Montserrat', 'Poppins', 'Playfair', 'Instrument serif', 
  'Merriweather', 'Bricolage', 'Jakarta', 'Manrope', 'Space grotesk', 
  'Work sans', 'Pt serif', 'Geist mono', 'Space mono', 'Quicksand', 
  'Nunito', 'Newsreader', 'Google sans-flex', 'Oswald', 'Dm sans', 
  'Cormorant garamond', 'Inter (Default)'
];

const fontPairings = [
  { h: 'Inter', b: 'Inter' },
  { h: 'Geist', b: 'Geist' },
  { h: 'Manrope', b: 'Inter' },
  { h: 'Playfair', b: 'Geist' },
  { h: 'Instrument', b: 'Inter' },
  { h: 'Jakarta', b: 'Geist' },
  { h: 'Nunito', b: 'Nunito' },
  { h: 'Bricolage', b: 'Inter' },
  { h: 'Newsreader', b: 'Inter' },
  { h: 'DM Sans', b: 'Inter' },
  { h: 'Oswald', b: 'Inter' },
  { h: 'Google Sans', b: 'Inter' },
  { h: 'Space Grotesk', b: 'Geist' },
  { h: 'Geist Mono', b: 'Geist Mono' },
  { h: 'Quicksand', b: 'Quicksand' },
  { h: 'Montserrat', b: 'Manrope' },
];

interface FontModalProps {
  onClose: () => void;
  onSelectFont: (font: string) => void;
}

export default function FontModal({ onClose, onSelectFont }: FontModalProps) {
  return (
    <div className="absolute top-16 right-4 bottom-4 w-80 bg-[#171717] border border-neutral-800 rounded-xl shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between p-4 border-b border-neutral-800">
        <h2 className="text-sm font-semibold text-white tracking-wide uppercase">Typography</h2>
        <button onClick={onClose} className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full transition-colors">
          <X size={16} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">Imported</h3>
            <button className="text-[10px] text-neutral-400 hover:text-white transition-colors">
              Clear All
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            {importedFonts.map((font, i) => (
              <button 
                key={i} 
                onClick={() => {
                  onSelectFont(font);
                  onClose();
                }}
                className="flex items-center justify-between px-3 py-2 bg-[#1a1a1a] border border-neutral-800 rounded-lg text-xs text-neutral-300 hover:border-neutral-600 hover:bg-neutral-800/50 text-left transition-all group"
              >
                <span style={{ fontFamily: font.includes('Default') ? 'inherit' : font }}>{font}</span>
                <X size={12} className="text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mb-3">Pairings</h3>
          <div className="grid grid-cols-1 gap-2">
            {fontPairings.map((pair, i) => (
              <button 
                key={i} 
                onClick={() => {
                  onSelectFont(`${pair.h} for headings and ${pair.b} for body`);
                  onClose();
                }}
                className="flex flex-col p-3 bg-[#1a1a1a] border border-neutral-800 rounded-lg hover:border-neutral-600 hover:bg-neutral-800/50 text-left transition-all"
              >
                <span className="text-sm text-white font-medium mb-0.5" style={{ fontFamily: pair.h === 'Playfair' ? 'serif' : 'sans-serif' }}>{pair.h}</span>
                <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-tight">{pair.b}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
