import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Canvas from './components/Canvas';
import Preview from './components/Preview';
import CodeEditor from './components/CodeEditor';
import FontModal from './components/FontModal';
import ColorModal from './components/ColorModal';
import AssetsModal from './components/AssetsModal';
import HomePage from './components/HomePage';
import { FileSystem } from './types';
import { generateDesignChange } from './services/aiService';
import { applyLocalDesignChange } from './services/designService';
import { supabase } from './services/supabaseService';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const [activeTab, setActiveTab] = useState('design');
  const [isFontModalOpen, setIsFontModalOpen] = useState(false);
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [isAssetsModalOpen, setIsAssetsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [files, setFiles] = useState<FileSystem>({
    'App.tsx': {
      name: 'App.tsx',
      path: 'App.tsx',
      language: 'typescript',
      content: 'export default function App() { return <div>Hello World</div>; }'
    },
    'preview.html': {
      name: 'preview.html',
      path: 'preview.html',
      language: 'html',
      content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Project</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #fff; color: #000; min-height: 100vh; }
    </style>
</head>
<body>
    <div id="root" class="min-h-screen flex items-center justify-center text-neutral-400">
        <div class="text-center">
            <h1 class="text-2xl font-light mb-2">Empty Canvas</h1>
            <p class="text-sm">Use the AI chat to start building your site.</p>
        </div>
    </div>
</body>
</html>`
    }
  });
  const [isRightPanelVisible, setIsRightPanelVisible] = useState(false);
  const [selectedElement, setSelectedElement] = useState<{ selector: string; content: string } | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'ELEMENT_SELECTED') {
        setSelectedElement(event.data.selector ? { selector: event.data.selector, content: event.data.content } : null);
      } else if (event.data.type === 'NAVIGATE') {
        handleDesignChange(`The user clicked a link to "${event.data.path}". Please update the preview.html to show the content of that page. If there are existing components for this page, use them.`);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [files, selectedElement]);

  const handleFilesGenerated = (newFiles: FileSystem, shouldSwitchTab: boolean = true) => {
    setFiles(newFiles);
    if (shouldSwitchTab && activeTab === 'design') {
      setActiveTab('preview');
    }
  };

  const handleDesignChange = async (prompt: string) => {
    setIsGenerating(true);
    try {
      const updatedFiles = await generateDesignChange(prompt, files, selectedElement);
      setFiles(updatedFiles);
    } catch (error) {
      console.error('Failed to apply design change:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInstantDesignChange = (type: 'font' | 'color' | 'text' | 'background' | 'corner' | 'shadow' | 'image', value: string) => {
    if (type === 'font' && !selectedElement) {
      alert('Please select an element on the canvas first to change its font.');
      return;
    }

    const updatedFiles = applyLocalDesignChange(type, value, files, selectedElement);
    setFiles(updatedFiles);
    
    // Optional: Background sync with AI to update React components
    // We don't set isGenerating=true here to keep it "instant"
    let prompt = '';
    switch (type) {
      case 'font': prompt = `Update the font of the selected element to ${value}. If no element is selected, update the primary body font.`; break;
      case 'color': prompt = `Update the text color of the selected element to ${value}.`; break;
      case 'text': prompt = `Update the text content of the selected element to: ${value}.`; break;
      case 'background': prompt = `Change the background color of the selected element to ${value}.`; break;
      case 'corner': prompt = `Set the border radius of the selected element to ${value}px.`; break;
      case 'shadow': prompt = `Apply a ${value} shadow to the selected element.`; break;
      case 'image': prompt = `Change the image source of the selected element to "${value}".`; break;
    }
      
    generateDesignChange(prompt, updatedFiles, selectedElement)
      .then(syncedFiles => {
        setFiles(syncedFiles);
      })
      .catch(err => console.error('Background design sync failed:', err));
  };

  const renderContent = () => {
    // Look for preview.html or any file ending in preview.html
    const previewFile = Object.keys(files).find(path => path.endsWith('preview.html'));
    const previewContent = (previewFile ? files[previewFile].content : null) || files['App.tsx']?.content || '';

    switch (activeTab) {
      case 'preview': return <Preview generatedCode={previewContent} isGenerating={isGenerating} />;
      case 'code': return <CodeEditor files={files} setFiles={setFiles} isGenerating={isGenerating} />;
      case 'design':
      default: return (
        <Canvas 
          generatedCode={previewContent} 
          isRightPanelVisible={isRightPanelVisible}
          setIsRightPanelVisible={setIsRightPanelVisible}
          onSelectElement={setSelectedElement}
          selectedElement={selectedElement}
          onUpdateFiles={setFiles}
          files={files}
          onApplyDesignChange={handleDesignChange}
          onInstantDesignChange={handleInstantDesignChange}
          isGenerating={isGenerating}
        />
      );
    }
  };

  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center bg-[#0a0a0a] text-white">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <HomePage onLogin={() => {}} />;
  }

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-neutral-300 font-sans overflow-hidden">
      <Sidebar 
        files={files} 
        onFilesGenerated={handleFilesGenerated} 
        selectedElement={selectedElement}
        onClearSelection={() => setSelectedElement(null)}
        isGenerating={isGenerating}
        setIsGenerating={setIsGenerating}
      />
      <div className="flex flex-col flex-1 relative min-w-0">
        <TopBar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          onOpenFonts={() => setIsFontModalOpen(true)}
          onOpenColors={() => setIsColorModalOpen(true)}
          onOpenAssets={() => setIsAssetsModalOpen(true)}
        />
        {renderContent()}
        
        {isFontModalOpen && (
          <FontModal 
            onClose={() => setIsFontModalOpen(false)} 
            onSelectFont={(font) => handleInstantDesignChange('font', font)}
          />
        )}
        {isColorModalOpen && (
          <ColorModal 
            onClose={() => setIsColorModalOpen(false)} 
            onSelectColor={(color) => handleInstantDesignChange('color', color)}
          />
        )}
        {isAssetsModalOpen && <AssetsModal onClose={() => setIsAssetsModalOpen(false)} />}
      </div>
    </div>
  );
}
