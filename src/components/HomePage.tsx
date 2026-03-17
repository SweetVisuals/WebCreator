import React, { useState } from 'react';
import { Sparkles, ArrowRight, Github, Mail, ArrowUp, Wand2, AtSign, Paperclip, Figma, Moon, Sun, Monitor, ChevronDown } from 'lucide-react';
import { signInWithGoogle } from '../services/supabaseService';

interface HomePageProps {
  onLogin: () => void;
}

export default function HomePage({ onLogin }: HomePageProps) {
  const [prompt, setPrompt] = useState('');

  const handleGoogleLogin = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      console.error('Error signing in with Google:', error.message);
      alert('Failed to sign in with Google. Please try again.');
    } else {
      onLogin();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <div className="flex items-center gap-8">
          <div className="text-2xl font-bold">A</div>
          <nav className="flex items-center gap-6 text-sm text-neutral-400">
            {['Create', 'Templates', 'Components', 'Assets', 'Skills', 'Learn', 'Pricing', 'Changelog'].map(item => (
              <a key={item} href="#" className="hover:text-white transition-colors">{item}</a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-[#1a1a1a] rounded-full p-1 border border-neutral-800">
            <button className="p-1.5 rounded-full hover:bg-neutral-700"><Sun size={16} /></button>
            <button className="p-1.5 rounded-full bg-neutral-700"><Monitor size={16} /></button>
            <button className="p-1.5 rounded-full hover:bg-neutral-700"><Moon size={16} /></button>
          </div>
          <button onClick={handleGoogleLogin} className="text-sm font-medium">SIGN IN</button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-3xl w-full text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-[#1a1a1a] border border-neutral-800 rounded-full px-4 py-1 text-xs text-neutral-400">
            <Sparkles size={14} className="text-yellow-500" /> Get up to 50% in affiliates revenue
          </div>
          
          <h1 className="text-7xl font-bold tracking-tighter">
            Create beautiful designs
          </h1>
          <p className="text-xl text-neutral-400">
            Generate top-tier landing pages in seconds. <a href="#" className="underline">Watch video.</a>
          </p>

          {/* Prompt Input */}
          <div className="bg-[#171717] border border-neutral-800 rounded-2xl p-4 shadow-2xl mt-8">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Create a landing page for a chat app called Aura in the style of Square.com"
              className="w-full bg-transparent text-lg text-white placeholder-neutral-600 resize-none outline-none min-h-[120px] p-2"
            />
            <div className="flex justify-between items-center mt-4 border-t border-neutral-800 pt-4">
              <div className="flex gap-2">
                <button className="flex items-center gap-2 bg-[#1a1a1a] border border-neutral-800 px-3 py-1.5 rounded-lg text-sm hover:border-neutral-600">
                  <Wand2 size={14} /> Prompt Builder
                </button>
                <button className="flex items-center gap-2 bg-[#1a1a1a] border border-neutral-800 px-3 py-1.5 rounded-lg text-sm hover:border-neutral-600">
                  <Sparkles size={14} /> Gemini 3.1 Pro <ChevronDown size={14} />
                </button>
                <button className="p-2 hover:bg-neutral-800 rounded-lg"><AtSign size={16} /></button>
                <button className="p-2 hover:bg-neutral-800 rounded-lg"><Paperclip size={16} /></button>
                <button className="p-2 hover:bg-neutral-800 rounded-lg"><Figma size={16} /></button>
              </div>
              <button 
                onClick={handleGoogleLogin}
                className="bg-white text-black p-2 rounded-full hover:bg-neutral-200 transition-all"
              >
                <ArrowUp size={16} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Trending */}
      <footer className="p-6 flex justify-between items-center border-t border-neutral-800">
        <h2 className="text-xl font-semibold">Trending</h2>
        <button className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white">
          Browse Trending <ArrowRight size={16} />
        </button>
      </footer>
    </div>
  );
}
