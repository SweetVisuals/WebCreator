import React from 'react';

interface PreviewProps {
  generatedCode: string;
  isGenerating: boolean;
}

export default function Preview({ generatedCode, isGenerating }: PreviewProps) {
  const isFullHtml = generatedCode.trim().toLowerCase().startsWith('<!doctype') || 
                     generatedCode.trim().toLowerCase().startsWith('<html');

  const srcDoc = isFullHtml ? generatedCode : `
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
  </style>
</head>
<body>
  ${generatedCode}
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
  </script>
</body>
</html>
  `;

  return (
    <div className="flex-1 bg-white m-4 rounded-xl shadow-2xl overflow-hidden flex items-center justify-center border border-neutral-200 relative">
      <iframe 
        srcDoc={srcDoc} 
        className={`w-full h-full border-none transition-opacity duration-300 ${isGenerating ? 'opacity-50' : 'opacity-100'}`} 
        title="Preview" 
        sandbox="allow-scripts allow-same-origin allow-forms"
      />

      {isGenerating && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/5 backdrop-blur-[1px] z-50">
          <div className="flex items-center gap-3 bg-white border border-neutral-200 rounded-full pl-4 pr-5 py-2 shadow-xl animate-in fade-in zoom-in duration-300">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium text-neutral-800">Navigating...</span>
          </div>
        </div>
      )}
    </div>
  );
}
