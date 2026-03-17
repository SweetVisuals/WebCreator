import { GoogleGenAI } from "@google/genai";
import { FileSystem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function generateDesignChange(
  prompt: string,
  currentFiles: FileSystem,
  selectedElement?: { selector: string; content: string } | null
): Promise<FileSystem> {
  const filesContext = Object.entries(currentFiles)
    .map(([path, file]) => `---FILE: ${path}---\n${file.content}\n---END---`)
    .join('\n\n');

  const selectionContext = selectedElement 
    ? `Selected Element Selector: ${selectedElement.selector}\nSelected Element Content: ${selectedElement.content}`
    : 'No specific element selected.';

  const fullPrompt = `
  Current Project Files:
  ${filesContext}

  Context:
  ${selectionContext}

  User Request:
  ${prompt}

  Please apply the changes and return the full updated file system.
  `;

  const result = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: fullPrompt,
    config: {
      systemInstruction: `You are an expert web designer and React developer. 
      Your task is to apply design changes to an existing project.
      
      CRITICAL: 
      1. You MUST return the ENTIRE updated file system.
      2. You MUST maintain the React component structure.
      3. You MUST update the 'preview.html' file to reflect all changes.
      4. If a selected element is provided, focus the change on that element, but if the user implies a global change (e.g., "change all headings"), apply it globally.
      5. Return the files in the format:
      ---FILE: path/to/file---
      content
      ---END---`
    }
  });
  
  const responseText = result.text;

  // Parse the response back into FileSystem
  const newFiles: FileSystem = { ...currentFiles };
  const fileBlocks = responseText.split(/---FILE: (.*?)---/);
  
  for (let i = 1; i < fileBlocks.length; i += 2) {
    const path = fileBlocks[i].trim();
    const content = fileBlocks[i + 1].split('---END---')[0].trim();
    if (path && content) {
      newFiles[path] = {
        name: path.split('/').pop() || path,
        path: path,
        language: path.endsWith('.tsx') ? 'typescript' : path.endsWith('.html') ? 'html' : 'css',
        content: content
      };
    }
  }

  return newFiles;
}
