import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronDown, LayoutGrid, Clock, Copy, RefreshCw, Sparkles, Paperclip, Mic, ArrowUp, MessageSquare, FileText, Database, Plus, Trash2, Folder, Settings } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || 'sk-9d478e2262ba40618884a066e05fcee1',
  baseURL: 'https://api.deepseek.com',
  dangerouslyAllowBrowser: true
});

interface Message {
  role: 'user' | 'model';
  text: string;
  time: string;
  filesSnapshot?: FileSystem;
}

import { FileSystem } from '../types';

interface SidebarProps {
  files: FileSystem;
  onFilesGenerated: (files: FileSystem, shouldSwitchTab?: boolean) => void;
  selectedElement: { selector: string; content: string } | null;
  onClearSelection: () => void;
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
}

export default function Sidebar({ files, onFilesGenerated, selectedElement, onClearSelection, isGenerating, setIsGenerating }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'pages' | 'settings'>('chat');
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Welcome! Your canvas is currently empty. What would you like to build? Just describe it, and I\'ll create it for you.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [input, setInput] = useState('');
  const [streamingText, setStreamingText] = useState('');
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [isThoughtsExpanded, setIsThoughtsExpanded] = useState(false);
  const [currentSteps, setCurrentSteps] = useState<string[]>([]);
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [selectedModel, setSelectedModel] = useState<'gemini' | 'deepseek'>('gemini');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const renderFileTree = (node: any, path: string = '') => {
    return Object.entries(node).map(([name, value]) => {
      const currentPath = path ? `${path}/${name}` : name;
      if (typeof value === 'string') {
        const isHtml = name.endsWith('.html');
        return (
          <div 
            key={currentPath} 
            className="group flex items-center justify-between p-2 pl-4 hover:bg-neutral-800/50 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <FileText size={14} className={isHtml ? "text-blue-400" : "text-neutral-500"} />
              <span className={`text-xs ${isHtml ? "text-neutral-200" : "text-neutral-400"}`}>{name}</span>
            </div>
            {isHtml && name !== 'preview.html' && name !== 'home.html' && (
              <button 
                onClick={() => handleRemovePage(currentPath)}
                className="p-1 text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
              >
                <RefreshCw size={12} className="rotate-45" />
              </button>
            )}
          </div>
        );
      } else {
        return (
          <div key={currentPath} className="flex flex-col gap-1">
            <div className="flex items-center gap-2 p-2 text-neutral-500">
              <LayoutGrid size={14} className="text-blue-400/60" />
              <span className="text-xs font-bold uppercase tracking-wider">{name}</span>
            </div>
            <div className="ml-3 border-l border-neutral-800 flex flex-col gap-1">
              {renderFileTree(value, currentPath)}
            </div>
          </div>
        );
      }
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating, streamingText]);

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;
    const userMsg = input.trim();
    setInput('');
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Save current files snapshot for rollback
    setMessages(prev => [...prev, { role: 'user', text: userMsg, time: now, filesSnapshot: { ...files } }]);
    setIsGenerating(true);
    setStreamingText('');
    setCurrentFile(null);
    setIsThoughtsExpanded(true);
    setCurrentSteps([]);
    setActiveStepIndex(-1);
    onClearSelection(); // Clear selection when sending a new message

    try {
      const filesContext = Object.entries(files).map(([path, file]) => `File: ${path}\n\`\`\`${file.language}\n${file.content}\n\`\`\``).join('\n\n');
      
      const selectionContext = selectedElement 
        ? `\n\nThe user has selected an element to edit:\nSelector: ${selectedElement.selector}\nContent: ${selectedElement.content}`
        : '';

      const backendContext = (supabaseUrl && supabaseKey)
        ? `\n\n### Backend Configuration (Supabase):
URL: ${supabaseUrl}
Key: ${supabaseKey}
Please use these credentials to implement real backend functionality if needed.`
        : '';

      const prompt = `You are an expert React developer and web designer. The user wants to build or modify a website. 

### CRITICAL INSTRUCTIONS:
1. **10-Step Plan**: Before writing ANY code, you MUST output a numbered 10-step plan detailing how you will build the requested feature.
2. **Component Outline**: List every React component you will create or modify. For each component, specify:
   - **Responsibility**: What does this component do?
   - **Connections**: What data does it receive/send? What other components does it interact with?
3. **Full Functionality**: Every feature requested (likes, playing, navigation, etc.) must be FULLY FUNCTIONAL. Do not use placeholders for logic. Implement the state management and event handlers.
4. **React Architecture**: Create a clean, component-based architecture in \`src/components/\`.
5. **Main Entry**: Use \`src/App.tsx\` as the main React entry point.
6. **Preview File**: You MUST ALWAYS update \`preview.html\`. This is a high-fidelity HTML/Tailwind version of the entire site. It must match the React design exactly and include all interactive logic (scripts) to make it "feel" real in the preview.

### Current Files:
${filesContext}
${selectionContext}${backendContext}

### User Request:
${userMsg}

### Output Format:
1. Start with the **10-Step Plan**.
2. Follow with the **Component Outline**.
3. Then provide the updated file system. For each file, provide the path and the code.
Format your response as a series of code blocks, each preceded by the filename on its own line.

Example:
src/components/Header.tsx
\`\`\`tsx
...
\`\`\`

preview.html
\`\`\`html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  ...
</body>
</html>
\`\`\`

Return the plan, outline, and code blocks. Do not include conversational filler.`;

      let fullText = '';
      const newFiles: FileSystem = { ...files };

      if (selectedModel === 'gemini') {
        const result = await ai.models.generateContentStream({
          model: 'gemini-3.1-pro-preview',
          contents: prompt,
        });
        
        for await (const chunk of result) {
          const chunkText = chunk.text || '';
          fullText += chunkText;
          processChunk(fullText, newFiles);
        }
      } else {
        const stream = await deepseek.chat.completions.create({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          stream: true,
        });

        for await (const chunk of stream) {
          const chunkText = chunk.choices[0]?.delta?.content || '';
          fullText += chunkText;
          processChunk(fullText, newFiles);
        }
      }

      if (fullText) {
        const updatedCount = Object.keys(newFiles).filter(path => newFiles[path].content !== files[path]?.content).length;
        onFilesGenerated({ ...newFiles }, true);
        setActiveStepIndex(currentSteps.length); // Mark all steps as complete
        setMessages(prev => [...prev, { 
          role: 'model', 
          text: updatedCount > 0 
            ? `I have updated ${updatedCount} file${updatedCount > 1 ? 's' : ''} and the preview for you.`
            : 'I processed your request but no file changes were detected. Please try being more specific.', 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        }]);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: 'Sorry, an error occurred while processing your request.', 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
    } finally {
      setIsGenerating(false);
      // Reset steps after a delay or keep them for the last message?
      // Let's keep them until the next generation starts
    }
  };

  const processChunk = (fullText: string, newFiles: FileSystem) => {
    setStreamingText(fullText);

    // Extract 10-Step Plan
    const planMatch = fullText.match(/10-Step Plan:?\s*\n([\s\S]*?)(?:\n\n|\nComponent Outline:|$)/i);
    if (planMatch) {
      const steps = planMatch[1]
        .split('\n')
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(line => line.length > 0);
      setCurrentSteps(steps);
      
      // Estimate active step based on progress through fullText
      // This is a simple heuristic: if we've started seeing file blocks, we're likely in the implementation phase
      if (fullText.includes('---FILE:') || fullText.includes('```')) {
        // Find which file we are currently on and map it to a step if possible
        // For now, let's just increment based on how many files we've matched
        const fileCount = (fullText.match(/---FILE:/g) || []).length;
        setActiveStepIndex(Math.min(steps.length - 1, 3 + fileCount)); // Assume first 3 steps are planning
      } else {
        setActiveStepIndex(Math.min(steps.length - 1, Math.floor(fullText.length / 500)));
      }
    }

    // More robust regex to handle various AI output formats
    // Matches: "filename", "File: filename", "**filename**", etc.
    const fileRegex = /(?:^|\n)(?:\*\*|File:\s*)?([a-zA-Z0-9_\-\.\/]+\.[a-z0-9]+)(?:\*\*)?\s*\n```(?:\w+)?\n([\s\S]*?)(?:```|$)/gi;
    let match;
    let matchedAny = false;

    while ((match = fileRegex.exec(fullText)) !== null) {
      const [_, path, content] = match;
      const extension = path.split('.').pop()?.toLowerCase() || '';
      const language = extension === 'tsx' || extension === 'ts' ? 'typescript' : 
                       extension === 'html' ? 'html' : 
                       extension === 'css' ? 'css' : 'javascript';
      
      newFiles[path] = {
        name: path.split('/').pop() || path,
        path: path,
        language: language,
        content: content.trim()
      };
      setCurrentFile(path);
      matchedAny = true;
    }

    if (matchedAny) {
      onFilesGenerated({ ...newFiles }, false);
    }
  };

  const handleRollback = (snapshot: FileSystem, index: number) => {
    onFilesGenerated(snapshot);
    // Remove all messages after the rolled back one
    setMessages(prev => prev.slice(0, index + 1));
  };

  const handleAddPage = () => {
    const pageName = prompt('Enter page name (e.g., about):');
    if (!pageName) return;
    
    const fileName = pageName.toLowerCase().endsWith('.html') ? pageName.toLowerCase() : `${pageName.toLowerCase()}.html`;
    
    if (files[fileName]) {
      alert('Page already exists!');
      return;
    }

    const newFiles = { ...files };
    newFiles[fileName] = {
      name: fileName,
      path: fileName,
      language: 'html',
      content: `<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white">
  <div class="p-8">
    <h1 class="text-4xl font-bold">${pageName}</h1>
    <p class="mt-4 text-gray-600">This is the ${pageName} page.</p>
  </div>
</body>
</html>`
    };
    onFilesGenerated(newFiles, true);
  };

  const handleRemovePage = (path: string) => {
    if (path === 'preview.html' || path === 'home.html') {
      alert('Cannot remove core pages.');
      return;
    }
    if (!confirm(`Are you sure you want to remove ${path}?`)) return;
    
    const newFiles = { ...files };
    delete newFiles[path];
    onFilesGenerated(newFiles, true);
  };

  return (
    <div className="w-[350px] border-r border-neutral-800 bg-[#0f0f0f] flex flex-col h-full shrink-0 z-20">
      {/* Top Navigation - Tabs */}
      <div className="flex items-center px-3 h-14 border-b border-neutral-800 text-xs shrink-0 gap-4">
        <button 
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${activeTab === 'chat' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
        >
          <MessageSquare size={14} />
          <span className="font-medium">Chat</span>
        </button>
        <button 
          onClick={() => setActiveTab('pages')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${activeTab === 'pages' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
        >
          <LayoutGrid size={14} />
          <span className="font-medium">Pages</span>
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
        >
          <Settings size={14} />
          <span className="font-medium">Settings</span>
        </button>
        <div className="flex-1" />
        <button className="p-1 hover:text-white bg-neutral-800/50 rounded transition-colors">
          <ChevronLeft size={14} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'chat' ? (
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 custom-scrollbar">
            {selectedElement && (
              <div className="bg-blue-600/10 border border-blue-600/20 rounded-xl p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Selected Element</span>
                  <button onClick={onClearSelection} className="text-blue-400 hover:text-blue-300 transition-colors">
                    <RefreshCw size={10} />
                  </button>
                </div>
                <div className="text-[10px] font-mono text-blue-300 truncate">
                  {selectedElement.selector}
                </div>
                <div className="text-[10px] text-neutral-400">
                  Ask AI to edit this specific element...
                </div>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-3 text-sm shadow-md whitespace-pre-wrap relative group ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm max-w-[90%]' 
                    : 'bg-[#171717] border border-neutral-800 text-neutral-300 rounded-2xl rounded-tl-sm max-w-[95%]'
                }`}>
                  {msg.text}
                  {msg.role === 'user' && msg.filesSnapshot && (
                    <button 
                      onClick={() => handleRollback(msg.filesSnapshot!, idx)}
                      className="absolute -left-10 top-1/2 -translate-y-1/2 p-2 bg-neutral-800 border border-neutral-700 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-700 transition-all opacity-0 group-hover:opacity-100 shadow-xl"
                      title="Rollback to this state"
                    >
                      <RefreshCw size={14} />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 text-neutral-500 text-[10px]">
                  <span className="flex items-center gap-1"><Clock size={10} /> {msg.time} {msg.role === 'model' && `• ${selectedModel === 'gemini' ? 'gemini-3.1-pro' : 'deepseek-chat'}`}</span>
                  <button className="hover:text-neutral-300 transition-colors"><Copy size={10} /></button>
                  {msg.role === 'user' && <button className="hover:text-neutral-300 transition-colors"><RefreshCw size={10} /></button>}
                </div>
              </div>
            ))}

            {isGenerating && (
              <div className="flex flex-col gap-3 items-start w-full">
                <div className="flex items-center gap-2 text-purple-400 text-xs font-medium">
                  <Sparkles size={14} className="animate-pulse" />
                  <span>AI is working...</span>
                </div>
                
                <div className="w-full bg-[#171717] border border-neutral-800 rounded-xl overflow-hidden shadow-lg">
                  <button 
                    onClick={() => setIsThoughtsExpanded(!isThoughtsExpanded)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-neutral-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                      <span className="text-xs font-medium text-neutral-300">AI Thoughts & Progress</span>
                    </div>
                    <ChevronDown size={14} className={`text-neutral-500 transition-transform duration-300 ${isThoughtsExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {isThoughtsExpanded && (
                    <div className="px-4 pb-4 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-300">
                      {currentSteps.length > 0 && (
                        <div className="flex flex-col gap-2 bg-black/20 rounded-lg p-3 border border-neutral-800/50">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Execution Plan</span>
                            <span className="text-[10px] text-neutral-500">{Math.max(0, activeStepIndex + 1)} / {currentSteps.length}</span>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            {currentSteps.map((step, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 transition-colors ${
                                  i < activeStepIndex ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 
                                  i === activeStepIndex ? 'bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.4)]' : 
                                  'bg-neutral-700'
                                }`} />
                                <span className={`text-[10px] leading-tight transition-colors ${
                                  i < activeStepIndex ? 'text-neutral-400 line-through' : 
                                  i === activeStepIndex ? 'text-white font-medium' : 
                                  'text-neutral-600'
                                }`}>
                                  {step}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {currentFile && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-[10px] text-purple-300">
                          <FileText size={12} />
                          <span>Working on: <span className="font-mono">{currentFile}</span></span>
                        </div>
                      )}

                      <div className="w-full bg-black/40 rounded-lg p-3 text-[10px] font-mono text-neutral-400 overflow-y-auto max-h-[200px] custom-scrollbar border border-neutral-800/50">
                        <div className="whitespace-pre-wrap break-all opacity-80">
                          {streamingText || 'Analyzing request and preparing files...'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        ) : activeTab === 'settings' ? (
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 custom-scrollbar">
            <div className="flex flex-col gap-4">
              <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Backend Configuration</h3>
              
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Supabase URL</label>
                <input 
                  type="text" 
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://your-project.supabase.co"
                  className="w-full bg-[#171717] border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Supabase Anon Key</label>
                <input 
                  type="password" 
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  placeholder="your-anon-key"
                  className="w-full bg-[#171717] border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <button 
                onClick={() => {
                  alert('Supabase configuration saved locally. The AI will now use these details for backend integrations.');
                }}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg transition-colors shadow-lg shadow-blue-600/20"
              >
                Save Configuration
              </button>
            </div>

            <div className="p-4 bg-neutral-900/50 border border-neutral-800 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Database size={14} className="text-blue-400" />
                <span className="text-xs font-bold text-neutral-300">Database Status</span>
              </div>
              <p className="text-[10px] text-neutral-500 leading-relaxed">
                Linking your site to Supabase allows for real-time data persistence, user authentication, and file storage.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Project Hierarchy</h3>
              <button 
                onClick={handleAddPage}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-[10px] text-white font-bold transition-all shadow-lg shadow-blue-600/20"
              >
                <Plus size={12} /> Add Page
              </button>
            </div>
            
            <div className="flex flex-col gap-2">
              {renderFileTree(tree)}
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-neutral-800 bg-[#0f0f0f]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex bg-[#1a1a1a] rounded-lg p-1 border border-neutral-800">
              <button 
                onClick={() => setSelectedModel('gemini')}
                className={`px-2 py-1 text-[10px] rounded-md transition-all ${selectedModel === 'gemini' ? 'bg-neutral-700 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
              >
                Gemini 3.1
              </button>
              <button 
                onClick={() => setSelectedModel('deepseek')}
                className={`px-2 py-1 text-[10px] rounded-md transition-all ${selectedModel === 'deepseek' ? 'bg-neutral-700 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
              >
                DeepSeek
              </button>
            </div>
          </div>
          <div className="flex bg-[#1a1a1a] rounded-lg p-1 border border-neutral-800">
            <button className="px-2 py-1 text-[10px] bg-neutral-700 text-white rounded-md transition-colors">Default</button>
            <button className="px-2 py-1 text-[10px] text-neutral-400 hover:text-white rounded-md transition-colors">Edits</button>
          </div>
        </div>
        
        <div className="bg-[#171717] border border-neutral-800 rounded-xl p-2 flex flex-col gap-2 focus-within:border-neutral-600 transition-colors shadow-inner">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type your message here..."
            className="w-full bg-transparent text-sm text-white placeholder-neutral-600 resize-none outline-none min-h-[40px] max-h-[120px] custom-scrollbar p-1"
            rows={1}
          />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button className="flex items-center gap-1.5 text-[10px] text-neutral-400 hover:text-white px-2 py-1.5 rounded-lg hover:bg-neutral-800 transition-colors">
                <Sparkles size={12} /> Prompt Builder
              </button>
            </div>
            
            <div className="flex items-center gap-1">
              <button className="text-neutral-400 hover:text-white p-1.5 rounded-lg hover:bg-neutral-800 transition-colors">
                <span className="text-sm font-medium">@</span>
              </button>
              <button className="text-neutral-400 hover:text-white p-1.5 rounded-lg hover:bg-neutral-800 transition-colors">
                <Paperclip size={14} />
              </button>
              <button className="text-neutral-400 hover:text-white p-1.5 rounded-lg hover:bg-neutral-800 transition-colors">
                <Mic size={14} />
              </button>
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isGenerating}
                className="bg-white text-black p-1.5 rounded-lg hover:bg-neutral-200 disabled:opacity-50 disabled:hover:bg-white ml-1 transition-colors shadow-lg"
              >
                <ArrowUp size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
