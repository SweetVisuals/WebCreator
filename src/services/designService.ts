import { FileSystem } from "../types";

export function applyLocalDesignChange(
  type: 'font' | 'color' | 'text' | 'background' | 'corner' | 'shadow' | 'image',
  value: string,
  currentFiles: FileSystem,
  selectedElement?: { selector: string; content: string } | null
): FileSystem {
  const newFiles = { ...currentFiles };
  const previewContent = newFiles['preview.html']?.content;

  if (!previewContent) return newFiles;

  const parser = new DOMParser();
  const doc = parser.parseFromString(previewContent, 'text/html');

  if (selectedElement && selectedElement.selector) {
    try {
      const elements = doc.querySelectorAll(selectedElement.selector);
      elements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        switch (type) {
          case 'font':
            const fontName = value.split(' (')[0].split(' for ')[0];
            htmlEl.style.fontFamily = `"${fontName}", sans-serif`;
            break;
          case 'color':
            htmlEl.style.color = value;
            break;
          case 'text':
            htmlEl.innerText = value;
            break;
          case 'background':
            htmlEl.style.backgroundColor = value;
            break;
          case 'corner':
            htmlEl.style.borderRadius = `${value}px`;
            break;
          case 'shadow':
            const shadows: Record<string, string> = {
              none: 'none',
              sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
              md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
              lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
              xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
            };
            htmlEl.style.boxShadow = shadows[value] || value;
            break;
          case 'image':
            if (htmlEl.tagName === 'IMG') {
              (htmlEl as HTMLImageElement).src = value;
            } else {
              htmlEl.style.backgroundImage = `url(${value})`;
            }
            break;
        }
      });
    } catch (e) {
      console.error('Failed to apply local change to selector:', selectedElement.selector, e);
    }
  } else {
    // Global changes
    switch (type) {
      case 'font':
        const fontName = value.split(' (')[0].split(' for ')[0];
        doc.body.style.fontFamily = `"${fontName}", sans-serif`;
        break;
      case 'color':
        doc.body.style.color = value;
        break;
      case 'background':
        doc.body.style.backgroundColor = value;
        break;
    }
  }

  newFiles['preview.html'] = {
    ...newFiles['preview.html'],
    content: doc.documentElement.outerHTML
  };

  return newFiles;
}
