import React from 'react';
import { X, Eye, Box } from 'lucide-react';

const assets = [
  { title: 'Unicorn Studio Animated Background Embed', author: 'Aksonvady Phomhome', views: 109, likes: 3, img: 'https://picsum.photos/seed/bg1/400/300' },
  { title: 'UnicornStudio Animated Black Hole Ba...', author: 'Sourany Phomhome', views: 51, likes: 5, img: 'https://picsum.photos/seed/bg2/400/300', pro: true },
  { title: 'UnicornStudio WEBGL Background', author: 'Sourany Phomhome', views: 54, likes: 7, img: 'https://picsum.photos/seed/bg3/400/300' },
  { title: 'UnicornStudio Background Bokeh-Gradient ...', author: 'Sourany Phomhome', views: 51, likes: 2, img: 'https://picsum.photos/seed/bg4/400/300' },
  { title: 'Full-Screen Unicorn Studio Aura Background', author: 'Sourasith Phomhome', views: 52, likes: 0, img: 'https://picsum.photos/seed/bg5/400/300' },
  { title: 'Full-Screen Unicorn Studio Aura Backg...', author: 'Sourasith Phomhome', views: 52, likes: 2, img: 'https://picsum.photos/seed/bg6/400/300', pro: true },
  { title: 'UnicornStudio Aura Background Conta...', author: 'Sourasith Phomhome', views: 101, likes: 0, img: 'https://picsum.photos/seed/bg7/400/300', pro: true },
  { title: 'Full-Page UnicornStudio Background C...', author: 'Aksonvady Phomhome', views: 104, likes: 4, img: 'https://picsum.photos/seed/bg8/400/300', pro: true },
];

interface AssetsModalProps {
  onClose: () => void;
}

export default function AssetsModal({ onClose }: AssetsModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-8">
      <div className="w-full max-w-6xl bg-[#0a0a0a] border border-neutral-800 rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-[#121212]">
          <h2 className="text-sm font-semibold text-white tracking-wide">ASSETS LIBRARY</h2>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full transition-colors">
            <X size={16} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-[#0a0a0a]">
          <div className="grid grid-cols-4 gap-4">
            {assets.map((asset, i) => (
              <div key={i} className="bg-[#171717] border border-neutral-800 rounded-xl overflow-hidden group cursor-pointer hover:border-neutral-600 transition-colors">
                <div className="aspect-video bg-neutral-900 relative">
                  <img src={asset.img} alt={asset.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
                </div>
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-xs font-medium text-neutral-200 line-clamp-1">{asset.title}</h3>
                    {asset.pro && <span className="text-[9px] px-1.5 py-0.5 bg-neutral-800 text-neutral-400 rounded border border-neutral-700">PRO</span>}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-neutral-700 overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${asset.author}`} alt="avatar" />
                      </div>
                      <span className="text-[10px] text-neutral-500">{asset.author}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-neutral-500">
                      <span className="flex items-center gap-0.5"><Eye size={10} /> {asset.views}</span>
                      <span className="flex items-center gap-0.5"><Box size={10} /> {asset.likes}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
