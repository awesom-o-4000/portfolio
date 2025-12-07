import React from 'react';
import { Search, TrendingUp, Command, Hash, Sparkles } from 'lucide-react';

export const SearchView: React.FC = () => {
  return (
    <div className="container mx-auto px-4 pt-20 pb-24 md:pt-24 md:pb-12 max-w-2xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Explore</h1>
        <p className="text-gray-400">Discover millions of AI-generated assets</p>
      </div>

      <div className="relative mb-8 group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative bg-surface border border-white/10 rounded-full flex items-center p-2 focus-within:border-primary/50 transition-colors">
          <Search className="w-5 h-5 text-gray-400 ml-3" />
          <input 
            type="text" 
            placeholder="Search for 'Cyberpunk City'..." 
            className="flex-1 bg-transparent border-none text-white px-4 py-2 focus:outline-none placeholder-gray-500"
            autoFocus
          />
          <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded border border-white/5 bg-white/5 text-[10px] text-gray-500 font-mono">
            <Command className="w-3 h-3" /> K
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Trending Searches
          </h3>
          <div className="flex flex-wrap gap-2">
            {['Neon Noir', 'Studio Ghibli Style', 'Isometric Room', 'Logo Design', 'Watercolor Portrait', '8-bit Pixel Art'].map(tag => (
              <button key={tag} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-sm transition-colors border border-white/5">
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div>
           <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Popular Models
          </h3>
          <div className="grid grid-cols-2 gap-3">
             {['Midjourney v6', 'DALL-E 3', 'Stable Diffusion XL', 'Magnific AI'].map(model => (
               <button key={model} className="flex items-center justify-between p-3 rounded-lg bg-surface border border-white/5 hover:border-primary/30 group transition-all">
                 <span className="text-sm text-gray-300 group-hover:text-white">{model}</span>
                 <Hash className="w-4 h-4 text-gray-600 group-hover:text-primary" />
               </button>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};