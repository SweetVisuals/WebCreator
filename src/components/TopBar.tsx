import React from 'react';
import { Monitor, Tablet, Smartphone, Type, Palette, Image as ImageIcon, Save, Undo, Redo, X, Pause, UserPlus, Download, Play } from 'lucide-react';

interface TopBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenFonts: () => void;
  onOpenColors: () => void;
  onOpenAssets: () => void;
}

export default function TopBar({ activeTab, setActiveTab, onOpenFonts, onOpenColors, onOpenAssets }: TopBarProps) {
  return (
    <div className="h-14 border-b border-neutral-800 bg-[#0a0a0a] flex items-center justify-between px-4 shrink-0 overflow-x-auto custom-scrollbar gap-4">
      {/* Left - Empty to balance right side or for future tools */}
      <div className="hidden lg:block flex-1"></div>

      {/* Center - Tools */}
      <div className="flex items-center gap-3 shrink-0">
        {/* View Toggle */}
        <div className="flex bg-[#171717] border border-neutral-800 rounded-lg p-0.5">
          {['Preview', 'Design', 'Code'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                activeTab === tab.toLowerCase() ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <button className="p-1.5 text-neutral-400 hover:text-white bg-[#171717] border border-neutral-800 rounded-lg transition-colors">
          <Pause size={14} />
        </button>

        <div className="w-px h-4 bg-neutral-800 mx-1"></div>

        {/* Design Tools */}
        <div className="flex gap-1">
          <button onClick={onOpenFonts} className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-neutral-400 hover:text-white bg-[#171717] border border-neutral-800 rounded-lg transition-colors">
            <Type size={12} /> Fonts
          </button>
          <button onClick={onOpenColors} className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-neutral-400 hover:text-white bg-[#171717] border border-neutral-800 rounded-lg transition-colors">
            <Palette size={12} /> Colors
          </button>
          <button onClick={onOpenAssets} className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-neutral-400 hover:text-white bg-[#171717] border border-neutral-800 rounded-lg transition-colors">
            <ImageIcon size={12} /> Assets
          </button>
        </div>

        <div className="w-px h-4 bg-neutral-800 mx-1"></div>

        {/* Actions */}
        <div className="flex bg-[#171717] border border-neutral-800 rounded-lg p-0.5">
          <button className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-neutral-400 hover:text-white border-r border-neutral-800 transition-colors">
            <Save size={12} /> Save
          </button>
          <button className="p-1.5 text-neutral-400 hover:text-white border-r border-neutral-800 transition-colors">
            <Undo size={12} />
          </button>
          <button className="p-1.5 text-neutral-400 hover:text-white border-r border-neutral-800 transition-colors">
            <Redo size={12} />
          </button>
          <button className="p-1.5 text-neutral-400 hover:text-white transition-colors">
            <X size={12} />
          </button>
        </div>

        <div className="w-px h-4 bg-neutral-800 mx-1"></div>

        {/* Devices */}
        <div className="flex bg-[#171717] border border-neutral-800 rounded-lg p-0.5">
          <button className="p-1.5 text-white bg-neutral-800 rounded-md transition-colors">
            <Monitor size={12} />
          </button>
          <button className="p-1.5 text-neutral-400 hover:text-white rounded-md transition-colors">
            <Tablet size={12} />
          </button>
          <button className="p-1.5 text-neutral-400 hover:text-white rounded-md transition-colors">
            <Smartphone size={12} />
          </button>
        </div>
      </div>

      {/* Right - Publish */}
      <div className="flex-1 flex justify-end items-center gap-2 shrink-0">
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-300 hover:text-white bg-[#171717] border border-neutral-800 rounded-lg transition-colors">
          <UserPlus size={12} /> Invite
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-300 hover:text-white bg-[#171717] border border-neutral-800 rounded-lg transition-colors">
          <Download size={12} /> Export
        </button>
        <button className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-[0_0_10px_rgba(37,99,235,0.4)] transition-colors">
          <Play size={12} fill="currentColor" /> Publish
        </button>
      </div>
    </div>
  );
}
