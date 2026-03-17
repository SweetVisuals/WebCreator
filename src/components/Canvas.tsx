import React, { useState } from 'react';
import { LayoutGrid, Settings, Image as ImageIcon, PanelRightClose, PanelRightOpen } from 'lucide-react';
import PresetsPanel from './PresetsPanel';
import SelectionAssetsPanel from './SelectionAssetsPanel';

import { FileSystem } from '../types';

interface CanvasProps {
  generatedCode: string;
  isRightPanelVisible: boolean;
  setIsRightPanelVisible: (visible: boolean) => void;
  onSelectElement: (element: { selector: string; content: string } | null) => void;
  selectedElement: { selector: string; content: string } | null;
  onUpdateFiles: (files: FileSystem) => void;
  files: FileSystem;
  onApplyDesignChange: (prompt: string) => void;
  onInstantDesignChange: (type: 'font' | 'color' | 'text' | 'background' | 'corner' | 'shadow' | 'image', value: string) => void;
  isGenerating: boolean;
}

export default function Canvas({ 
  generatedCode, 
  isRightPanelVisible, 
  setIsRightPanelVisible, 
  onSelectElement,
  selectedElement,
  onUpdateFiles,
  files,
  onApplyDesignChange,
  onInstantDesignChange,
  isGenerating
}: CanvasProps) {
  const [activeRightPanel, setActiveRightPanel] = useState<'presets' | 'assets' | null>('presets');

  const isFullHtml = generatedCode.trim().toLowerCase().startsWith('<!doctype') || 
                     generatedCode.trim().toLowerCase().startsWith('<html');

  const selectionScript = `
  <script>
    // Handle link navigation
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link) {
        const href = link.getAttribute('href');
        
        // Allow hash links for same-page navigation
        if (href && href.startsWith('#')) {
          return;
        }

        // Prevent default navigation for all other links
        e.preventDefault();
        e.stopPropagation();
        
        // If it's an internal-looking link, notify the parent to "navigate" via AI
        if (href && !href.startsWith('http') && href !== 'javascript:void(0)' && href !== '#') {
          window.parent.postMessage({
            type: 'NAVIGATE',
            path: href
          }, '*');
        }
      }
    }, true);

    // Element selection logic
    let hoveredEl = null;
    let selectedEl = null;

    document.addEventListener('mouseover', (e) => {
      if (hoveredEl) hoveredEl.classList.remove('ai-hover');
      hoveredEl = e.target;
      if (hoveredEl !== document.body && hoveredEl !== document.documentElement) {
        hoveredEl.classList.add('ai-hover');
      }
    });

    document.addEventListener('click', (e) => {
      // Don't trigger selection if we're clicking a link that we're handling for navigation
      const link = e.target.closest('a');
      if (link && link.getAttribute('href') && !link.getAttribute('href').startsWith('#')) {
        return;
      }

      if (selectedEl) selectedEl.classList.remove('ai-selected');
      selectedEl = e.target;
      if (selectedEl !== document.body && selectedEl !== document.documentElement) {
        selectedEl.classList.add('ai-selected');
        
        // Generate a simple selector (tag + classes)
        const selector = selectedEl.tagName.toLowerCase() + 
          (selectedEl.className ? '.' + Array.from(selectedEl.classList).filter(c => !c.startsWith('ai-')).join('.') : '');
        
        window.parent.postMessage({
          type: 'ELEMENT_SELECTED',
          selector: selector,
          content: selectedEl.outerHTML
        }, '*');
      } else {
        window.parent.postMessage({ type: 'ELEMENT_SELECTED', selector: null, content: null }, '*');
      }
    });
  </script>
  `;

  const styles = `
  <style>
    body { margin: 0; padding: 0; cursor: default; }
    .ai-selected { outline: 2px solid #3b82f6 !important; outline-offset: -2px; }
    .ai-hover { outline: 1px dashed #3b82f6 !important; outline-offset: -2px; }
    html { scroll-behavior: smooth; }
    /* Hide scrollbars during generation to avoid flickering */
    body.is-generating { overflow: hidden !important; }
  </style>
  `;

  let srcDoc = '';
  if (isFullHtml) {
    // Inject styles and script into the full HTML
    srcDoc = generatedCode.replace('</head>', `${styles}</head>`).replace('</body>', `${selectionScript}</body>`);
  } else {
    srcDoc = `
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
  ${styles}
</head>
<body>
  ${generatedCode || '<div class="flex items-center justify-center h-screen bg-neutral-900 text-neutral-500 font-sans">Canvas is empty. Give a prompt to start building.</div>'}
  ${selectionScript}
</body>
</html>
    `;
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main Canvas Area */}
      <div className="flex-1 bg-[#121212] m-4 rounded-xl border border-neutral-800/50 shadow-2xl overflow-hidden relative flex items-center justify-center">
        <iframe 
          srcDoc={srcDoc} 
          className={`w-full h-full border-none bg-white transition-opacity duration-300 ${isGenerating ? 'opacity-50' : 'opacity-100'}`} 
          title="Canvas" 
          sandbox="allow-scripts allow-same-origin allow-forms"
        />

        {isGenerating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-[2px] z-50">
            <div className="flex items-center gap-3 bg-[#171717] border border-neutral-800 rounded-full pl-4 pr-5 py-2 shadow-2xl animate-in fade-in zoom-in duration-300">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium text-white">Navigating...</span>
            </div>
          </div>
        )}
        
        {/* Canvas Toolbar */}
        <div className="absolute top-4 left-4 flex gap-2">
          <div className="flex items-center gap-2 bg-[#171717] border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-400 shadow-sm">
            <span className="text-white">Canvas</span>
            <span className="text-neutral-600">-</span>
            <span>75%</span>
            <span className="text-neutral-600">+</span>
          </div>
          <button className="p-1.5 bg-[#171717] border border-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors shadow-sm">
            <LayoutGrid size={14} />
          </button>
        </div>
        
        {/* Right Panel Toggles (Floating) */}
        <div className="absolute top-4 right-4 flex gap-2">
          {!isRightPanelVisible && (
            <button 
              onClick={() => setIsRightPanelVisible(true)}
              className="p-1.5 bg-[#171717] border border-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors shadow-sm"
              title="Open Panels"
            >
              <PanelRightOpen size={14} />
            </button>
          )}
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#171717] border border-neutral-800 rounded-lg text-xs text-neutral-400 hover:text-white transition-colors shadow-sm">
            Layers
          </button>
          <button 
            onClick={() => {
              setActiveRightPanel(prev => prev === 'presets' ? null : 'presets');
              if (!isRightPanelVisible) setIsRightPanelVisible(true);
            }}
            className={`p-1.5 rounded-lg border transition-colors shadow-sm ${activeRightPanel === 'presets' && isRightPanelVisible ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-[#171717] border-neutral-800 text-neutral-400 hover:text-white'}`}
          >
            <Settings size={14} />
          </button>
          <button 
            onClick={() => {
              setActiveRightPanel(prev => prev === 'assets' ? null : 'assets');
              if (!isRightPanelVisible) setIsRightPanelVisible(true);
            }}
            className={`p-1.5 rounded-lg border transition-colors shadow-sm ${activeRightPanel === 'assets' && isRightPanelVisible ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-[#171717] border-neutral-800 text-neutral-400 hover:text-white'}`}
          >
            <ImageIcon size={14} />
          </button>
        </div>
      </div>

      {/* Right Panels */}
      {isRightPanelVisible && (
        <>
          {activeRightPanel === 'presets' && (
            <PresetsPanel 
              onCollapse={() => setIsRightPanelVisible(false)} 
              selectedElement={selectedElement}
              onApplyDesignChange={onApplyDesignChange}
              onInstantDesignChange={onInstantDesignChange}
              isGenerating={isGenerating}
            />
          )}
          {activeRightPanel === 'assets' && <SelectionAssetsPanel onClose={() => setActiveRightPanel(null)} onCollapse={() => setIsRightPanelVisible(false)} />}
        </>
      )}
    </div>
  );
}
