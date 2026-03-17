import React, { useState } from 'react';
import { FileCode, Folder, ChevronRight, ChevronDown, File as FileIcon, Search, Settings, Copy, MoreVertical } from 'lucide-react';
import { FileSystem, FileSystemItem } from '../types';

interface CodeEditorProps {
  files: FileSystem;
  setFiles: (files: FileSystem) => void;
  isGenerating?: boolean;
}

export default function CodeEditor({ files, setFiles, isGenerating }: CodeEditorProps) {
  const [activeFilePath, setActiveFilePath] = useState<string>(Object.keys(files)[0] || '');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src', 'src/components']));

  const activeFile = files[activeFilePath];

  const handleContentChange = (newContent: string) => {
    if (!activeFile) return;
    setFiles({
      ...files,
      [activeFilePath]: {
        ...activeFile,
        content: newContent
      }
    });
  };

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  // Simple file tree grouping
  const tree: any = {};
  Object.keys(files).forEach(path => {
    const parts = path.split('/');
    let current = tree;
    parts.forEach((part, i) => {
      if (i === parts.length - 1) {
        current[part] = path;
      } else {
        if (!current[part]) current[part] = {};
        current = current[part];
      }
    });
  });

  const renderTree = (node: any, path: string = '') => {
    return Object.entries(node).map(([name, value]) => {
      const currentPath = path ? `${path}/${name}` : name;
      if (typeof value === 'string') {
        return (
          <button
            key={currentPath}
            onClick={() => setActiveFilePath(value)}
            className={`w-full flex items-center gap-2 px-3 py-1 text-xs transition-colors ${
              activeFilePath === value ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200'
            }`}
          >
            <FileIcon size={14} className="shrink-0" />
            <span className="truncate">{name}</span>
          </button>
        );
      } else {
        const isExpanded = expandedFolders.has(currentPath);
        return (
          <div key={currentPath}>
            <button
              onClick={() => toggleFolder(currentPath)}
              className="w-full flex items-center gap-1 px-2 py-1 text-xs text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200 transition-colors"
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <Folder size={14} className="shrink-0 text-blue-400/60" />
              <span className="truncate font-medium">{name}</span>
            </button>
            {isExpanded && (
              <div className="ml-3 border-l border-neutral-800">
                {renderTree(value, currentPath)}
              </div>
            )}
          </div>
        );
      }
    });
  };

  return (
    <div className="flex-1 bg-[#0d0d0d] m-4 rounded-xl border border-neutral-800 shadow-2xl overflow-hidden flex">
      {/* Sidebar (File Tree) */}
      <div className="w-60 border-r border-neutral-800 bg-[#0f0f0f] flex flex-col shrink-0">
        <div className="h-10 border-b border-neutral-800 flex items-center justify-between px-3">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Explorer</span>
          <div className="flex items-center gap-1">
            <button className="p-1 text-neutral-500 hover:text-white transition-colors"><Search size={12} /></button>
            <button className="p-1 text-neutral-500 hover:text-white transition-colors"><Settings size={12} /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
          {renderTree(tree)}
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Tabs */}
        <div className="h-10 border-b border-neutral-800 bg-[#121212] flex items-center overflow-x-auto custom-scrollbar">
          {Object.keys(files).map(path => (
            <button
              key={path}
              onClick={() => setActiveFilePath(path)}
              className={`h-full px-4 flex items-center gap-2 border-r border-neutral-800 text-xs transition-colors shrink-0 ${
                activeFilePath === path ? 'bg-[#0d0d0d] text-white border-t-2 border-t-blue-500' : 'bg-[#171717] text-neutral-500 hover:bg-[#1a1a1a]'
              }`}
            >
              <FileCode size={12} className={activeFilePath === path ? 'text-blue-400' : ''} />
              {files[path].name}
            </button>
          ))}
        </div>

        {/* Breadcrumbs */}
        <div className="h-7 bg-[#0d0d0d] border-b border-neutral-800 flex items-center px-4 gap-2 text-[10px] text-neutral-500">
          {activeFilePath.split('/').map((part, i, arr) => (
            <React.Fragment key={i}>
              <span className="hover:text-neutral-300 cursor-pointer">{part}</span>
              {i < arr.length - 1 && <ChevronRight size={10} />}
            </React.Fragment>
          ))}
          <div className="flex-1" />
          <button className="hover:text-white transition-colors"><Copy size={12} /></button>
          <button className="hover:text-white transition-colors"><MoreVertical size={12} /></button>
        </div>

        {/* Editor */}
        <div className="flex-1 relative overflow-hidden">
          {isGenerating && (
            <div className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-medium text-blue-400 uppercase tracking-wider">AI Streaming...</span>
            </div>
          )}
          <textarea 
            value={activeFile?.content || ''}
            onChange={(e) => handleContentChange(e.target.value)}
            className="absolute inset-0 w-full h-full bg-transparent text-neutral-300 font-mono text-sm resize-none outline-none p-4 custom-scrollbar leading-relaxed"
            spellCheck={false}
            placeholder="// Select a file to start editing"
          />
          
          {/* Line Numbers (Visual only) */}
          <div className="absolute left-0 top-0 bottom-0 w-10 bg-[#0d0d0d] border-r border-neutral-800/50 flex flex-col items-center pt-4 select-none pointer-events-none">
            {Array.from({ length: 50 }).map((_, i) => (
              <span key={i} className="text-[10px] text-neutral-700 leading-relaxed h-[1.625rem]">{i + 1}</span>
            ))}
          </div>
          <div className="absolute left-10 right-0 top-0 bottom-0 pointer-events-none">
            {/* This could be used for syntax highlighting overlays in the future */}
          </div>
        </div>

        {/* Status Bar */}
        <div className="h-6 bg-blue-600 flex items-center px-3 justify-between text-[10px] text-white font-medium">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">Main</span>
            <span className="flex items-center gap-1">0 Errors</span>
          </div>
          <div className="flex items-center gap-4">
            <span>UTF-8</span>
            <span>TypeScript JSX</span>
            <span>Ln 1, Col 1</span>
          </div>
        </div>
      </div>
    </div>
  );
}
